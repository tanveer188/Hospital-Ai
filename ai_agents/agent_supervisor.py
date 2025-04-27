"""
# Healthcare Multi-agent Supervisor

This script implements a multi-agent system with a supervisor that orchestrates different healthcare agents.
The supervisor routes tasks between a booking agent that manages appointments (using MCP server),
an EMR agent that handles medical records, and a billing query agent that processes billing inquiries.
The agents work together under the direction of the supervisor to handle various healthcare-related tasks.
"""

import os
import logging
import asyncio
import time
from typing import Annotated, Literal, Union
from typing_extensions import TypedDict
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Import LangChain components
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI

# Import LangGraph components
from langgraph.graph import MessagesState, StateGraph, START, END
from langgraph.types import Command
from langgraph.prebuilt import create_react_agent

# Import MCP components for booking agent
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from langchain_mcp_adapters.tools import load_mcp_tools

# Check if required API keys are present
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY not found in .env file")

# Set the API key for OpenAI
os.environ["OPENAI_API_KEY"] = openai_api_key
logger.info("API key loaded successfully")

# Initialize the LLM
llm = ChatOpenAI(model="gpt-4o")
logger.info("ChatOpenAI model initialized")

# Configure MCP server for booking agent
server_params = StdioServerParameters(
    command="python",
    # Use absolute path to ensure it's found
    args=[os.path.join(os.path.dirname(__file__), "app.py")],
)

emr_server_params = StdioServerParameters(
    command="python",
    # Use absolute path to ensure it's found
    args=[os.path.join(os.path.dirname(__file__), "mcp_emr.py")],
)

billing_server_params = StdioServerParameters(
     command="python",
    # Use absolute path to ensure it's found
    args=[os.path.join(os.path.dirname(__file__), "mcp_biling.py")],
)


logger.info(f"MCP server path: {os.path.join(os.path.dirname(__file__), 'app.py')}")
logger.info("MCP server parameters set up")



@tool
def billing_query_tool(
    invoice_id: Annotated[str, "The invoice ID to look up"],
):
    """Query the billing system for invoice information."""
    # Sample data - this would be replaced with actual billing system integration
    sample_billing = {
        "INV-1001": {
            "patient": "John Doe",
            "amount": "$150.00",
            "status": "Paid",
            "date": "2025-03-15",
        },
        "INV-1002": {
            "patient": "Jane Smith",
            "amount": "$75.50",
            "status": "Pending",
            "date": "2025-04-01",
        }
    }
    
    if invoice_id in sample_billing:
        invoice = sample_billing[invoice_id]
        return f"Invoice {invoice_id}: Patient: {invoice['patient']}, Amount: {invoice['amount']}, Status: {invoice['status']}, Date: {invoice['date']}"
    else:
        return f"Invoice ID {invoice_id} not found in the system"

# Create Agent Supervisor
members = ["booking_agent", "emr_agent", "billing_agent", "user"]  # Add "user"
options = members + ["FINISH"]

system_prompt = (
    "You are a healthcare system supervisor tasked with managing a conversation between the"
    f" following workers: {members}. Given the following user request,"
    " respond with the worker to act next. Each worker will perform a"
    " task and respond with their results and status."
    "\n\n- booking_agent: For appointment scheduling, availability checks, or modifying appointments"
    "\n- emr_agent: For patient medical record queries, medical history, medications, or allergies"
    "\n- billing_agent: For invoice lookups, payment status, or insurance queries"
    "\n- user: To get more information or clarification from the user"
    "\n\nWhen the task is complete, respond with FINISH."
)

class Router(TypedDict):
    """Worker to route to next. If no workers needed, route to FINISH."""
    next: Union[Literal["booking_agent"], Literal["emr_agent"], Literal["billing_agent"], Literal["user"], Literal["FINISH"]]

class State(MessagesState):
    next: str

def supervisor_node(state: State) -> Command[Union[Literal["booking_agent"], Literal["emr_agent"], Literal["billing_agent"], Literal["user"], Literal["__end__"]]]:
    messages = [
        {"role": "system", "content": system_prompt},
    ] + state["messages"]
    response = llm.with_structured_output(Router).invoke(messages)
    goto = response["next"]
    if goto == "FINISH":
        goto = END

    return Command(goto=goto, update={"next": goto})

# Update booking agent to include message history and handle the complete booking flow
async def run_booking_agent(messages):
    """Connect to MCP server and run booking agent with the complete message history."""
    start_time = time.time()
    
    logger.info("Initializing stdio client for booking agent")
    async with stdio_client(server_params) as (read, write):
        logger.info(f"Stdio client initialized - elapsed: {time.time() - start_time:.2f}s")
        
        async with ClientSession(read, write) as session:
            logger.info("Initializing session connection")
            await session.initialize()
            logger.info(f"Session initialized - elapsed: {time.time() - start_time:.2f}s")

            logger.info("Loading MCP tools")
            tools = await load_mcp_tools(session)
            logger.info(f"MCP tools loaded - elapsed: {time.time() - start_time:.2f}s")

            # Revised system prompt optimized for tool usage and booking flow
            booking_system_prompt = """You are an efficient and friendly healthcare appointment scheduling assistant. Your primary goal is to help users find available appointment slots and book them using the provided tools.

            Available Tools and Their Usage:
            - `find_doctor_slots(doctor_name)`: Use this FIRST to find the *next* 5-7 available time slots for a specific doctor, starting from the current time. Requires the doctor's full name or partial name.
            - `check_slot_availability(doctor_name, appointment_date, appointment_time)`: Use this ONLY if the user asks about a *specific* date (YYYY-MM-DD) and time (HH:MM) that was NOT listed by `find_doctor_slots`. Requires doctor's name, date, and time.
            - `suggest_doctor_by_specialty(specialty)`: Use this if the user doesn't have a specific doctor in mind and asks for a recommendation based on a medical specialty (e.g., Cardiology, Pediatrics). Requires the specialty.
            - `book_appointment(patient_name, phone_number, doctor_name, appointment_date, appointment_time)`: Use this as the FINAL step to book the appointment ONLY AFTER you have confirmed the exact doctor, date (YYYY-MM-DD), time (HH:MM), the patient's full name, and the patient's phone number.

            Follow this precise booking process:
            1.  **Identify Need:** Ask the user which doctor they wish to see or what medical specialty they need.
            2.  **Suggest Doctor (If Necessary):** If a specialty is given, use `suggest_doctor_by_specialty` to list doctors. Let the user choose one.
            3.  **Find Initial Slots:** Once a doctor is identified, use `find_doctor_slots` with the doctor's name to present the *next available* appointment times. Clearly state these are the soonest slots found.
            4.  **Handle Specific Time Queries (If Necessary):** If the user asks if a *different*, specific date/time is available, use `check_slot_availability` for that specific slot.
            5.  **Confirm Selection:** Guide the user to select one specific, available slot (confirming doctor, date, and time).
            6.  **Gather Patient Details for Booking:** Explicitly ask for the patient's **full name** and **phone number**. State these are required to finalize the booking.
            7.  **Execute Booking:** Use the `book_appointment` tool with ALL required details: patient's full name, patient's phone number, doctor's name, confirmed date (YYYY-MM-DD), and confirmed time (HH:MM).
            8.  **Confirm & Summarize:** Relay the booking confirmation message and all appointment details (including appointment ID) from the `book_appointment` tool's response back to the user. If booking fails, clearly state the reason provided by the tool.

            IMPORTANT RULES:
            - Adhere strictly to the tool descriptions and required arguments (YYYY-MM-DD for dates, HH:MM for times).
            - NEVER attempt `book_appointment` without the patient's full name AND phone number.
            - ALWAYS complete the booking process once started and provide the final confirmation details or the exact error message from the `book_appointment` tool. Do not stop midway.
            """

            logger.info("Creating booking agent with improved prompt")
            agent = create_react_agent(llm, tools, prompt=booking_system_prompt)
            logger.info(f"Booking agent created - elapsed: {time.time() - start_time:.2f}s")
            
            logger.info("Invoking booking agent with full message history")
            agent_response = await agent.ainvoke({"messages": messages})
            logger.info(f"Booking agent response received - elapsed: {time.time() - start_time:.2f}s")
            
            # Extract final response content
            for message in reversed(agent_response["messages"]):
                if hasattr(message, "content") and message.__class__.__name__ == "AIMessage":
                    return message.content
            
            return "No response from booking agent. Please try again."

def booking_node(state: State) -> Command[Literal["user"]]:
    # Convert all state messages to LangChain format for the agent
    agent_messages = []
    for msg in state["messages"]:
        if isinstance(msg, dict):
            if msg.get("role") == "user":
                agent_messages.append(HumanMessage(content=msg.get("content")))
            elif msg.get("role") == "assistant":
                # Include agent name in content to provide context
                content = msg.get("content", "")
                name = msg.get("name", "")
                if name and name != "booking_agent":
                    content = f"[{name}]: {content}"
                agent_messages.append(AIMessage(content=content))
        elif hasattr(msg, "type") and msg.type == "human":
            agent_messages.append(HumanMessage(content=msg.content))
        elif hasattr(msg, "type") and msg.type == "ai":
            agent_messages.append(AIMessage(content=msg.content))
        elif isinstance(msg, tuple) and msg[0] == "user":
            agent_messages.append(HumanMessage(content=msg[1]))
    
    if not agent_messages:
        response_message = {"role": "assistant", "name": "booking_agent", 
                           "content": "Could not process booking request due to missing query."}
        return Command(
            update={"messages": state["messages"] + [response_message]},
            goto="user",
        )
    
    try:
        # Run async function with full message history
        response = asyncio.run(run_booking_agent(agent_messages))
        
        response_message = {"role": "assistant", "name": "booking_agent", "content": response}
        print("--------")
        print("--------")
        print("--------")
        print("--------")
        print("--------")
        print("--------")
        print(f"Booking agent response: {response_message}")
        print("--------")
        print("--------")
        print("--------")
        print("--------")
        print("--------")
        print("--------")
        return Command(
            update={"messages": state["messages"] + [response_message]},
            goto="user",
        )
    except Exception as e:
        logger.error(f"Error in booking agent: {e}")
        error_message = {"role": "assistant", "name": "booking_agent", 
                        "content": f"Error processing booking request: {str(e)}"}
        return Command(
            update={"messages": state["messages"] + [error_message]},
            goto="user",
        )
        
async def run_emr_agent(messages):
    """Connect to MCP server and run emr agent with the complete message history."""
    start_time = time.time()
    
    logger.info("Initializing stdio client for booking agent")
    async with stdio_client(emr_server_params) as (read, write):
        logger.info(f"Stdio client initialized - elapsed: {time.time() - start_time:.2f}s")
        
        async with ClientSession(read, write) as session:
            logger.info("Initializing session connection")
            await session.initialize()
            logger.info(f"Session initialized - elapsed: {time.time() - start_time:.2f}s")

            logger.info("Loading MCP tools")
            tools = await load_mcp_tools(session)
            logger.info(f"MCP tools loaded - elapsed: {time.time() - start_time:.2f}s")

            # Create a more robust prompt that handles the complete booking flow
            emr_system_prompt = """You are a healthcare electronic medical record (EMR) assistant.
            Help users retrieve patient medical records.
            
            Follow these steps for accessing EMR data:
            1. Get the patient's first and last name to identify the record
            2. Look up the requested medical information using the available tools
            3. Present the medical record information in a clear, organized manner
            """

            logger.info("Creating emr agent with improved prompt")
            agent = create_react_agent(llm, tools, prompt=emr_system_prompt)
            logger.info(f"emr agent created - elapsed: {time.time() - start_time:.2f}s")
            
            logger.info("Invoking emr agent with full message history")
            agent_response = await agent.ainvoke({"messages": messages})
            logger.info(f"emr agent response received - elapsed: {time.time() - start_time:.2f}s")
            
            # Extract final response content
            for message in reversed(agent_response["messages"]):
                if hasattr(message, "content") and message.__class__.__name__ == "AIMessage":
                    return message.content
            
            return "No response from emr agent. Please try again."

# Update EMR agent to include message history
def emr_node(state: State) -> Command[Literal["user"]]:
    # Convert all state messages to LangChain format
    agent_messages = []
    for msg in state["messages"]:
        if isinstance(msg, dict):
            if msg.get("role") == "user":
                agent_messages.append(HumanMessage(content=msg.get("content")))
            elif msg.get("role") == "assistant":
                agent_messages.append(AIMessage(content=msg.get("content", "")))
        elif hasattr(msg, "type") and msg.type == "human":
            agent_messages.append(HumanMessage(content=msg.content))
        elif hasattr(msg, "type") and msg.type == "ai":
            agent_messages.append(AIMessage(content=msg.content))
        elif isinstance(msg, tuple) and msg[0] == "user":
            agent_messages.append(HumanMessage(content=msg[1]))
    
    # Pass the full message history to the agent
    result = asyncio.run(run_emr_agent(agent_messages))
    print("--------")
    print("--------")
    print("--------")
    print("--------")
    print("--------")
    print("--------")
    print(f"EMR agent response: {result}")
    print("--------")
    print("--------")
    print("--------")
    print("--------")
    print("--------")
    print("--------")
    response_message = {"role": "assistant", "name": "emr_agent", 
                       "content": result}
    
    return Command(
        update={"messages": state["messages"] + [response_message]},
        goto="user",
    )
    
async def run_billing_agent(messages) -> str:
    """Connect to MCP server and run Billing agent with LangChain message list."""
    if not llm: return "Error: Billing Agent LLM not available."
    start_time = time.time(); logger.info("Initializing stdio client for Billing agent")
    try:
        # Use the billing_server_params defined earlier
        async with stdio_client(billing_server_params) as (read, write):
             logger.info(f"Billing Stdio client initialized - elapsed: {time.time() - start_time:.2f}s")
             async with ClientSession(read, write) as session:
                  logger.info("Initializing Billing session"); await session.initialize(); logger.info(f"Billing Session initialized - elapsed: {time.time() - start_time:.2f}s")
                  logger.info("Loading Billing MCP tools"); tools = await load_mcp_tools(session); logger.info(f"Billing MCP tools loaded - elapsed: {time.time() - start_time:.2f}s")

                  # Define a system prompt for the billing agent
                  billing_system_prompt = """You are a healthcare billing assistant. Your goal is to help users retrieve billing information using the patient's username.

                  Available Tools:
                  - `get_billing_by_username(username, include_details)`: Fetches billing records for a patient. Requires the patient's username. `include_details` is optional (defaults to True).

                  Process:
                  1. Ask the user for the patient's username whose billing information they need.
                  2. Use the `get_billing_by_username` tool with the provided username.
                  3. Present the billing information clearly to the user, summarizing key details like total amount, balance, and status for recent invoices. If details were included, mention that.
                  4. If the tool returns an error (e.g., user not found), relay that information to the user.
                  """
                  logger.info("Creating Billing agent"); agent = create_react_agent(llm, tools, prompt=billing_system_prompt); logger.info(f"Billing agent created - elapsed: {time.time() - start_time:.2f}s")
                  logger.info("Invoking Billing agent"); agent_response = await agent.ainvoke({"messages": messages}); logger.info(f"Billing agent response received - elapsed: {time.time() - start_time:.2f}s")
                  print(f"\n--- DEBUG: Billing Agent Full Response ---\n{agent_response}\n--- END DEBUG ---\n", file=sys.stderr) # Add debug log
                  for message in reversed(agent_response["messages"]):
                       if isinstance(message, AIMessage): return message.content
                  return "No response content found from Billing agent."
    except Exception as e:
        logger.exception(f"Error during Billing agent execution: {e}"); print(f"\n--- ERROR in run_billing_agent ---\n{e}\n--- END ERROR ---\n"); return f"Error running Billing agent: {str(e)}"


# Update billing agent to include message history
def billing_node(state: State) -> Command[Literal["user"]]:
    # Convert all state messages to LangChain format
    agent_messages = []
    for msg in state["messages"]:
        if isinstance(msg, dict):
            if msg.get("role") == "user":
                agent_messages.append(HumanMessage(content=msg.get("content")))
            elif msg.get("role") == "assistant":
                agent_messages.append(AIMessage(content=msg.get("content", "")))
        elif hasattr(msg, "type") and msg.type == "human":
            agent_messages.append(HumanMessage(content=msg.content))
        elif hasattr(msg, "type") and msg.type == "ai":
            agent_messages.append(AIMessage(content=msg.content))
        elif isinstance(msg, tuple) and msg[0] == "user":
            agent_messages.append(HumanMessage(content=msg[1]))
    
    # Pass the full message history to the agent
    result = asyncio.run(run_billing_agent(agent_messages))
    response_message = {"role": "assistant", "name": "billing_agent", 
                       "content": result}
    
    return Command(
        update={"messages": state["messages"] + [response_message]},
        goto="user",
    )

# Update the user node to go to supervisor
def user_node(state: State) -> Command[Literal["supervisor"]]:
    # Get input from user
    user_input = input("Please provide more information: ")
    user_message = {"role": "user", "content": user_input}
    return Command(
        update={
            "messages": state["messages"] + [user_message]
        },
        goto="supervisor",
    )

# Build and compile the graph
builder = StateGraph(State)
builder.add_edge(START, "supervisor")
builder.add_node("supervisor", supervisor_node)
builder.add_node("booking_agent", booking_node)
builder.add_node("emr_agent", emr_node)
builder.add_node("billing_agent", billing_node)
builder.add_node("user", user_node)  # Add user node
graph = builder.compile()

# Main execution block
if __name__ == "__main__":
    custom_query = input("Enter your healthcare question: ")
    print(f"Running query: {custom_query}")
    for s in graph.stream(
        {"messages": [("user", custom_query)]}, subgraphs=True
    ):
        print(s)
        print("----")