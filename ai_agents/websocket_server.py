import asyncio
import websockets
import subprocess
import sys
import os
import logging
import json

# Configure logging for the server
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("WebSocketServer")

# --- Configuration ---
HOST = "localhost"
PORT = 8765
# Assume agent_supervisor.py is in the same directory as this server script
AGENT_SCRIPT_NAME = "agent_supervisor.py"
AGENT_SCRIPT_PATH = os.path.join(os.path.dirname(__file__), AGENT_SCRIPT_NAME)
# --- End Configuration ---

# Dictionary to store conversation state (message history) per client connection
conversation_states = {}

async def run_agent_script(input_state_json: str) -> (str, str):
    """
    Runs the agent_supervisor.py script in a subprocess,
    passes the input state JSON via stdin, and captures stdout/stderr.
    """
    if not os.path.exists(AGENT_SCRIPT_PATH):
        error_msg = f"Error: Agent script not found at: {AGENT_SCRIPT_PATH}"
        logger.error(error_msg)
        return None, error_msg

    command = [sys.executable, AGENT_SCRIPT_PATH]
    logger.info(f"Running command: {' '.join(command)}")
    logger.info(f"Passing state via stdin (length: {len(input_state_json)}): {input_state_json[:200]}...")

    try:
        process = await asyncio.create_subprocess_exec(
            *command,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

        stdout_data, stderr_data = await process.communicate(input=input_state_json.encode('utf-8'))

        await process.wait()

        output_json = stdout_data.decode('utf-8', errors='ignore').strip()
        error = stderr_data.decode('utf-8', errors='ignore').strip()

        logger.info(f"Agent script finished with return code: {process.returncode}")

        if error:
            logger.warning(f"Agent script stderr:\n{error}")

        if process.returncode != 0 and not output_json:
            logger.error(f"Agent script failed (code {process.returncode}) with no stdout state.")
            return None, f"Agent script failed with code {process.returncode}.\nStderr:\n{error}"

        logger.info(f"Agent script stdout (potential JSON state, length: {len(output_json)}):\n{output_json[:500]}...")
        return output_json, error

    except FileNotFoundError:
        error_msg = f"Error: Python executable or script not found. Command: {command}"
        logger.error(error_msg)
        return None, "Server Error: Could not execute the agent script (FileNotFoundError)."
    except Exception as e:
        logger.exception(f"An unexpected error occurred while running the agent script: {e}")
        return None, f"Server Error: An unexpected error occurred: {str(e)}"


async def handler(websocket):
    """Handles incoming WebSocket connections and messages, maintaining state."""
    client_addr = websocket.remote_address
    logger.info(f"Client connected: {client_addr}")
    if websocket not in conversation_states:
        conversation_states[websocket] = {"messages": []}
        logger.info(f"Initialized new state for {client_addr}")

    try:
        async for message in websocket:
            logger.info(f"Received message from {client_addr}: {message[:100]}...")

            current_state = conversation_states.get(websocket, {"messages": []})
            current_messages = current_state.get("messages", [])

            new_user_message = {"role": "user", "content": str(message)}
            updated_messages = current_messages + [new_user_message]

            input_state = {"messages": updated_messages}

            try:
                input_state_json = json.dumps(input_state)
            except TypeError as e:
                logger.error(f"Failed to serialize input state to JSON: {e}")
                await websocket.send(f"Server Error: Could not prepare data for agent: {e}")
                continue

            output_state_json, agent_stderr = await run_agent_script(input_state_json)

            response_to_client = ""
            if output_state_json:
                try:
                    final_state = json.loads(output_state_json)
                    if isinstance(final_state, dict) and "messages" in final_state:
                        final_messages = final_state["messages"]
                        conversation_states[websocket] = final_state
                        logger.info(f"Updated state for {client_addr}. Total messages: {len(final_messages)}")

                        num_old_messages = len(updated_messages)
                        new_messages = final_messages[num_old_messages:]

                        new_responses = []
                        for msg in new_messages:
                            role = msg.get("role", "unknown")
                            content = msg.get("content", "*No content*")
                            name = msg.get("name")
                            if role == "system" and "Waiting for user input" in content:
                                continue
                            if name:
                                new_responses.append(f"[{name} ({role})]: {content}")
                            else:
                                new_responses.append(f"[{role}]: {content}")

                        if new_responses:
                            response_to_client = "\n".join(new_responses)
                        else:
                            last_msg = final_messages[-1] if final_messages else None
                            if last_msg and last_msg.get("role") == "system" and "Waiting for user input" in last_msg.get("content", ""):
                                question = "[Agent needs more information]"
                                if len(final_messages) > 1 and final_messages[-2].get("role") == "assistant":
                                    question = f"[{final_messages[-2].get('name', 'assistant')}]: {final_messages[-2].get('content')}"
                                response_to_client = question
                            elif last_msg and last_msg.get("role") == "assistant":
                                response_to_client = f"[{last_msg.get('name', 'assistant')}]: {last_msg.get('content')}"
                            else:
                                response_to_client = "[Agent processed the request. Task may be complete.]"

                        if agent_stderr:
                            response_to_client += f"\n\n--- Agent Notes/Errors ---\n{agent_stderr}"

                    else:
                        logger.error(f"Agent output was not valid JSON state: {output_state_json[:500]}...")
                        response_to_client = f"Server Error: Agent script returned invalid state format.\nAgent stderr:\n{agent_stderr}"
                except json.JSONDecodeError:
                    logger.error(f"Failed to decode agent JSON output: {output_state_json[:500]}...")
                    response_to_client = f"Server Error: Failed to parse agent output.\nRaw Output:\n{output_state_json}\nAgent stderr:\n{agent_stderr}"
            else:
                response_to_client = agent_stderr

            logger.info(f"Sending response to {client_addr} (length: {len(response_to_client)})...")
            await websocket.send(response_to_client)
            logger.info("Response sent.")

    except websockets.exceptions.ConnectionClosedOK:
        logger.info(f"Client {client_addr} disconnected normally.")
    except websockets.exceptions.ConnectionClosedError as e:
        logger.warning(f"Client {client_addr} disconnected with error: {e}")
    except Exception as e:
        logger.exception(f"An error occurred in the WebSocket handler for {client_addr}: {e}")
        try:
            await websocket.send(f"Server Error: {str(e)}")
        except Exception:
            logger.error(f"Failed to send error message to client {client_addr}.")
    finally:
        logger.info(f"Connection closed for {client_addr}")
        if websocket in conversation_states:
            del conversation_states[websocket]
            logger.info(f"Cleaned up state for {client_addr}")


async def main():
    """Starts the WebSocket server."""
    if not os.path.exists(AGENT_SCRIPT_PATH):
        logger.error(f"Agent script '{AGENT_SCRIPT_NAME}' not found in the directory '{os.path.dirname(__file__)}'. Please place it there.")
        return

    logger.info(f"Starting WebSocket server on ws://{HOST}:{PORT}")
    logger.info(f"Will execute agent script: {AGENT_SCRIPT_PATH}")
    async with websockets.serve(handler, HOST, PORT):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server stopped manually.")