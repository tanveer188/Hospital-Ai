# Create server parameters for stdio connection
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from langchain_mcp_adapters.tools import load_mcp_tools
from langgraph.prebuilt import create_react_agent

from langchain_openai import ChatOpenAI
import asyncio
import logging
import time

from dotenv import load_dotenv
import os
# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Get the OpenAI API key from environment variables
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY not found in .env file")

# Set the API key for OpenAI
os.environ["OPENAI_API_KEY"] = openai_api_key
logger.info("API key loaded successfully")

model = ChatOpenAI(model="gpt-4o")
logger.info("ChatOpenAI model initialized")

server_params = StdioServerParameters(
    command="python",
    # Use absolute path to ensure it's found
    args=[os.path.join(os.path.dirname(__file__), "app.py")],
)
logger.info(os.path.join(os.path.dirname(__file__), "app.py"))
logger.info("Server parameters set up")

async def main():
    logger.info("Starting main function")
    start_time = time.time()
    
    logger.info("Initializing stdio client")
    async with stdio_client(server_params) as (read, write):
        logger.info("Stdio client initialized - elapsed: %.2fs", time.time() - start_time)
        
        logger.info("Creating client session")
        async with ClientSession(read, write) as session:
            # Initialize the connection
            logger.info("Initializing session connection")
            await session.initialize()
            logger.info("Session initialized - elapsed: %.2fs", time.time() - start_time)

            # Get tools
            logger.info("Loading MCP tools")
            tools = await load_mcp_tools(session)
            logger.info("MCP tools loaded - elapsed: %.2fs", time.time() - start_time)

            # Create and run the agent
            logger.info("Creating agent")
            agent = create_react_agent(model, tools)
            logger.info("Agent created - elapsed: %.2fs", time.time() - start_time)
            
            logger.info("Invoking agent with query")
            agent_response = await agent.ainvoke({"messages": [{"role": "user", "content": "Appointment Available of Priya Patel on 2025-04-09"}]})
            logger.info("Agent response received - elapsed: %.2fs", time.time() - start_time)
            
            # Extract and format the final response content
            try:
                # Get the last AI message content
                for message in reversed(agent_response["messages"]):
                    if hasattr(message, "additional_kwargs") and message.__class__.__name__ == "AIMessage":
                        final_content = message.content
                        # Print with formatting
                        logger.info("-" * 50)
                        logger.info("FINAL RESPONSE:")
                        logger.info("-" * 50)
                        logger.info(final_content)
                        logger.info("-" * 50)
                        break
                else:
                    logger.info("No AI response content found in the messages.")
            except Exception as e:
                logger.error(f"Error extracting response content: {e}")
                
            # Log the full response object if needed for debugging
            logger.debug(f"Complete agent response: {agent_response}")

# Run the async main function
if __name__ == "__main__":
    try:
        logger.info("Script started")
        asyncio.run(main())
    except Exception as e:
        logger.exception(f"Error in main: {e}")