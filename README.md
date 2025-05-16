# 🏥 Hospital AI Agents

A multi-agent AI system that simulates an agentic AI workforce to automate and streamline hospital workflows.

## 🏴‍☠️ Pirates Duo Team

| Member | Role |
|--------|------|
| Tanveer Husain | Agent Developer |

## 🎯 Problem Statement

### Objective
Design and implement a multi-agent AI system to simulate an Agentic AI workforce for hospital workflows.

### Scope
- Appointment scheduling
- EMR data retrieval
- Billing validation

### Requirements
- Agents should be autonomous
- Agents should communicate with each other
- Agents should collectively complete tasks

### Expected Outcome
End-to-end working demo with 2-3 agents automating tasks like patient appointment booking, EMR fetching, and billing information validation.

## 🔍 Solution Architecture

Our solution consists of two core modules:

### Module 1: Multi-Agent System
A network of specialized AI agents that work together to handle different aspects of hospital workflows:
- Supervisor Agent: Orchestrates the workflow between different agents
- Booking Agent: Handles appointment scheduling
- EMR Agent: Retrieves patient medical history
- Billing Validation Agent: Verifies billing information

The agents leverage:
- Long-term memory
- Keyword memory
- Short-term memory
- User authorization

### Module 2: AI Call Agent
An intelligent voice assistant that can:
- Process incoming calls using Azure Speech-to-Text
- Schedule, reschedule, or cancel appointments
- Handle billing validation
- Send SMS notifications and payment links via Twilio
- Convert responses back to speech

## 🛠️ Technology Stack

### Voice & Communication
- Google Speech-to-Text
- ElevenLabs
- Twilio

### AI Orchestration & Interaction
- LangGraph
- LangChain
- OpenAI LLMs
- MCP (Model Context Protocol)
- Selenium and Playwright

### Data Management
- PostgreSQL
- Redis
- Vector DB (e.g., Pinecone)

## 🔑 Key Technologies

### LangGraph
LangGraph uses a graph-based workflow where each node is an agent or function, and edges define communication. This ensures controlled management of interactions and data flow.

### MCP Protocol
MCP (Model Context Protocol) connects AI agents, linking each model with online data and useful tools.

## 💪 Impact and Societal Benefits

- **Accessibility**: Multilingual AI with phone/web modes ensures everyone—urban or rural—can use it
- **Patient Understanding**: Quick EMR insights for better understanding
- **Personalized Support**: Custom chatbots for each patient to assist doctors in decision-making
- **Inclusivity**: Hindi speech support enhances rural reach
- **Efficiency**: Reduces patient wait times and staff workload

## 🔮 Future Roadmap

- **National Integration**: Seamless EMR access via Arogya Setu / Ayushman Bharat
- **Multi-model Integration**: Analyze EMR data including lab reports, X-rays, CT scans, and diagnostic records
- **Multilingual Support**: Expand to regional languages (Marathi, Tamil, Bengali, etc.)
- **IoT Integration**: Sync health vitals from smartwatches for real-time monitoring
- **Blockchain Security**: Ensure secure, tamper-proof medical data storage
- **Prescription Intelligence**: Validate prescriptions, check drug conflicts, allergies, and side effects
- **Private LLM**: Local LLM integration for enhanced security and privacy of patient data

📅 Appointment Management System
![111](https://github.com/user-attachments/assets/b635aa07-04c2-4bbe-b6cf-9c1f5d766798)


![222](https://github.com/user-attachments/assets/ac8cf4ea-1249-436a-9b1f-3994986e28a5)

![333](https://github.com/user-attachments/assets/7d2eaaf2-d1b8-41aa-bf4e-9680bfb8c9f8)

![image](https://github.com/user-attachments/assets/956a84f4-6240-41b5-a301-61124f95ecd8)



## 📚 References

1. [Revolutionizing healthcare: the role of artificial intelligence in clinical practice](https://www.example.com/reference1)
2. [Artificial intelligence in healthcare: transforming the practice of medicine](https://www.example.com/reference2)
3. [Agentic AI for Scientific Discovery](https://www.example.com/reference3)
4. [Agentic AI: Autonomous Intelligence for Complex Goals](https://www.example.com/reference4)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



