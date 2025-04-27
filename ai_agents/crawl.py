import os
import json
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.tools import Tool
from pydantic import BaseModel, Field
from typing import List, Type, Optional
import traceback

# --- New Imports ---
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import markdownify
from tavily import TavilyClient

# --- Configuration and Initialization ---

# Load environment variables from .env file
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in environment variables.")
if not TAVILY_API_KEY:
    raise ValueError("TAVILY_API_KEY not found in environment variables.")

# Initialize Tavily Client
try:
    tavily_client = TavilyClient(api_key=TAVILY_API_KEY)
    print("TavilyClient initialized successfully.")
except Exception as e:
    print(f"Error initializing TavilyClient: {e}")
    tavily_client = None

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o", temperature=0, api_key=OPENAI_API_KEY)

# --- Playwright Scraping Tool Definition ---

def playwright_scrape_url(url: str) -> str:
    """
    Scrapes the main content of a given URL using Playwright, converts it to Markdown,
    and returns the result.

    Args:
        url: The URL to scrape (must start with http:// or https://).

    Returns:
        A string containing the scraped content in Markdown format, or an error message.
    """
    if not url.startswith("http://") and not url.startswith("https://"):
        return "Error: Invalid URL provided. URL must start with http:// or https://"

    print(f"--- Scraping URL with Playwright: {url} ---")
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.goto(url, timeout=60000)
            page.wait_for_load_state('networkidle', timeout=60000)

            html_content = page.inner_html('body')
            browser.close()

        if not html_content:
            return f"Failed to retrieve content from URL: {url}. Page body was empty."

        soup = BeautifulSoup(html_content, 'html.parser')
        for script_or_style in soup(["script", "style"]):
            script_or_style.decompose()

        markdown_content = markdownify.markdownify(str(soup), heading_style="ATX", strip=['script', 'style'])

        if not markdown_content:
            return f"Failed to convert content to Markdown for URL: {url}. Content might be heavily JavaScript-reliant or structured unusually."

        content = markdown_content[:8000]
        print(f"--- Successfully scraped and converted content (first 8000 chars) from {url} ---")
        return f"Successfully Scraped Content from URL {url}:\n\n{content}"

    except Exception as e:
        print(f"Error during Playwright scraping for URL '{url}': {type(e).__name__} - {e}")
        print(traceback.format_exc())
        return f"Error scraping URL {url}: {type(e).__name__} - {e}"

# --- Tavily Search Tool Definition ---

def tavily_web_search(query: str, num_results: int = 5) -> str:
    """
    Performs a web search using the Tavily Search API for a given query,
    focusing on finding relevant medical information, case studies, and treatment approaches.

    Args:
        query: A search query (e.g., "treatment for stage IV NSCLC").
        num_results: Number of search results to retrieve.

    Returns:
        A string containing formatted search results (title, URL, brief content snippet),
        or an error message.
    """
    if not tavily_client:
        return "Error: Tavily client is not initialized."

    print(f"--- Searching with Tavily for: '{query}' (limit: {num_results}) ---")
    try:
        search_response = tavily_client.search(
            query=query,
            search_depth="advanced",
            max_results=num_results,
            include_answer=False,
            include_raw_content=False,
            include_images=False,
        )

        results = search_response.get('results', [])

        if not results:
            print(f"--- No search results found via Tavily for query: '{query}' ---")
            return f"No search results found for '{query}'."

        formatted_results = f"Search Results for '{query}':\n\n"
        for i, result in enumerate(results):
            title = result.get('title', 'N/A')
            url = result.get('url', 'N/A')
            snippet = result.get('content', 'No snippet available.')[:500]
            formatted_results += f"{i+1}. Title: {title}\n   URL: {url}\n   Snippet: {snippet}...\n\n"

        print(f"--- Found {len(results)} results via Tavily, returning formatted summary ---")
        return formatted_results.strip()

    except Exception as e:
        print(f"Error during Tavily search for query '{query}': {type(e).__name__} - {e}")
        print(traceback.format_exc())
        return f"Error using Tavily search tool: {type(e).__name__} - {e}"

# --- Create LangChain Tools ---

scrape_tool = Tool(
    name="web_scraper",
    func=playwright_scrape_url,
    description="""Use this tool ONLY to scrape the full content of a specific web page URL (e.g., 'https://pubmed.ncbi.nlm.nih.gov/...').
    Provide ONLY the URL as input. It returns the main content of the page in Markdown format.
    Do NOT use this for general web searches; use the 'web_search' tool for that.""",
)

search_tool = Tool(
    name="web_search",
    func=tavily_web_search,
    description="""Use this tool to search the web for medical information, treatments, or similar case studies using a search query.
    Provide a search query (e.g., 'treatment for stage IV NSCLC').
    It returns a list of search results with titles, URLs, and snippets. Use these results to decide if specific URLs should be scraped using the 'web_scraper' tool.""",
)

tools = [search_tool, scrape_tool]

# --- MediScope Agent Prompt ---
MEDISCOPE_SYSTEM_PROMPT = """
You are **MediScope**, an expert medical assistant agent trained to support healthcare professionals by accurately answering medical questions using reliable and cited sources.

## 🧠 CORE OBJECTIVE
- Provide concise, evidence-based answers to medical questions or summaries for medical topics.
- Minimize hallucination by always backing claims with **linked citations** from **verified medical sources**.
- Search for relevant information, including **similar real-world cases** (with citation) and **treatment approaches**. Use the `web_search` tool first with a search query based on the user's input. Then, if promising URLs are found in the search results, use the `web_scraper` tool to scrape content from those specific URLs (like PubMed, WHO, CDC articles).

## 🔗 CITATION REQUIREMENTS
- Each factual claim must be supported with a **hyperlinked source**, preferably from:
  - PubMed (pubmed.ncbi.nlm.nih.gov)
  - WHO (who.int)
  - CDC (cdc.gov)
  - Medscape (medscape.com)
  - NIH (nih.gov, ncbi.nlm.nih.gov/pmc/)
  - Reputed peer-reviewed journals (links often found via PubMed or search results)
- Format: `[Source Name](link)` or `[Title](link)`
- Group all sources at the end under a section titled **"📚 References"**.

## 🔍 INFORMATION & CASE RETRIEVAL
- Use the available tools strategically:
    1.  **First, search (`web_search`):** Provide a relevant search query based on the user's input (question or topic statement) to find articles, guidelines, or potential case studies. Review the titles, URLs, and snippets returned.
    2.  **Then, scrape (if needed, `web_scraper`):** If the search results provide promising URLs (e.g., specific PubMed articles, case reports), use the `web_scraper` tool with the specific URL to get detailed markdown content. Choose the most relevant URL(s) to scrape based on the search results. Provide ONLY the URL to the `web_scraper` tool.
- Summarize relevant findings from the search results or scraped content. If retrieving cases, briefly describe 1-2 relevant cases found, how they were handled, and link to their original sources (the URL you scraped or found in search results).
- Mention similarities and differences from the user’s case if applicable and details are provided.

## 🛡️ GUARDRAILS
- DO NOT fabricate any medical information.
- IF no relevant source or case is found after searching and scraping attempts, reply: "**I could not find reliable citations or similar cases for this specific query after searching. Please consult specialist literature or databases.**"
- Clarify ambiguous or incomplete questions before answering. Ask *one* follow-up question if needed.
- Maintain a neutral, clinical, and helpful tone.
- Never give personal or speculative advice. Only report findings from sources.
- Label speculative content clearly if unavoidable (but aim to avoid).
- Use layman-friendly terms when possible, unless the query suggests a clinician audience.

## 🧬 TECHNICAL BEHAVIOR
- Use tools strategically: Understand Input -> Formulate Search Query -> Use `web_search` -> Analyze Results -> Identify Promising URLs -> Use `web_scraper` (with URL if needed) -> Synthesize -> Cite -> Answer.
- If multiple interpretations are possible, ask for clarification.
- Structure the final answer strictly as follows:

🩺 **Diagnosis Summary / Information Overview**:
[Concise summary of information requested or topic overview, with inline citations like [Source Name](link).]
[Optionally include a key quote or finding like: 📌 "Key finding from a study."] [Study Link]

🧬 **Similar Cases / Treatment Approaches**:
🔎 Case 1: [Brief description based on search/scraped content, including treatment approach if found.] [Original Source URL]
🔎 Case 2: [Brief description based on search/scraped content, including treatment approach if found.] [Original Source URL]
(Include if relevant findings/cases are found via search/scraping)

✅ **Recommended Approach / Key Considerations (Based on Evidence)**:
[Synthesized points based *only* on the cited evidence. Avoid definitive instructions.]

📚 **References**:
- [Title/Source Name](link)
- [Title/Source Name](link)

## 👤 USER CONTEXT
- Primary user: Certified medical professionals.
- Assume clinical knowledge, but require summarized evidence and citations.

Begin. Wait for the user's medical question or topic.
"""

prompt = ChatPromptTemplate.from_messages(
    [
        SystemMessage(content=MEDISCOPE_SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="chat_history"),
        HumanMessage(content="{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)

# --- Agent Creation ---

agent = create_openai_functions_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True, max_iterations=10)

# --- Main Execution Loop ---

if __name__ == "__main__":
    print("MediScope Agent Initialized (using Tavily/Playwright). Ask a medical question or state a topic.")
    chat_history = []
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Exiting MediScope.")
            break

        if not tavily_client:
            print("Error: Tavily client not available. Cannot perform web searches.")
            continue

        try:
            result = agent_executor.invoke({
                "input": user_input,
                "chat_history": chat_history
            })
            response = result["output"]

            chat_history.append(HumanMessage(content=user_input))
            chat_history.append(AIMessage(content=response))

            if len(chat_history) > 10:
                chat_history = chat_history[-10:]

            print(f"\nMediScope:\n{response}\n")

        except Exception as e:
            print(f"An error occurred during agent execution: {e}")
            print(traceback.format_exc())