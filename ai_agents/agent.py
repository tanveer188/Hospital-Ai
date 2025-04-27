# This code depends on pip install langchain[openai] python-dotenv
import os
from dotenv import load_dotenv
from langgraph.prebuilt import create_react_agent

# Load environment variables from .env file
load_dotenv()

# Get the OpenAI API key from environment variables
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY not found in .env file")

# Set the API key for OpenAI
os.environ["OPENAI_API_KEY"] = openai_api_key

def search(query: str):
    """Call to surf the web."""
    if "sf" in query.lower() or "san francisco" in query.lower():
        return "It's 60 degrees and foggy."
    return "It's 90 degrees and sunny."

agent = create_react_agent("openai:gpt-4o", tools=[search])
response = agent.invoke(
    {"messages": [{"role": "user", "content": "what is the weather in sf"}]}
)

# Print the output
print("\nAgent Response:")
print(response)

# For easier reading, extract and print just the content of the last message
if "messages" in response and response["messages"]:
    last_message = response["messages"][-1]
    print("\nFinal Answer:")
    print(last_message.content)