import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, RefreshCw, User, FileText, Clock } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const AIChatAssistant: React.FC = () => {
  const { emrs } = useAppContext();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const patients = Object.values(emrs);
  
  // Get selected patient data
  const selectedPatient = selectedPatientId ? emrs[selectedPatientId] : null;
  
  // Mock responses based on patient data
  const getMockResponse = (message: string, patientId: string): string => {
    const patient = emrs[patientId];
    
    if (!patient) return "I don't have data for this patient.";
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('summary') || lowerMessage.includes('overview')) {
      return `${patient.name} is a ${new Date().getFullYear() - new Date(patient.dob).getFullYear()}-year-old ${patient.gender.toLowerCase()} with a history of ${patient.conditions.join(' and ')}. They are currently taking ${patient.medications.map(m => m.name).join(' and ')} for these conditions. Their last vitals were BP ${patient.vitalSigns.bloodPressure}, HR ${patient.vitalSigns.heartRate} bpm, and O2 sat ${patient.vitalSigns.oxygenSaturation}%.`;
    }
    
    if (lowerMessage.includes('lab') || lowerMessage.includes('results') || lowerMessage.includes('tests')) {
      if (patient.labResults.length === 0) {
        return "There are no recent lab results for this patient.";
      }
      
      const labSummary = patient.labResults.map(lab => 
        `${lab.name} (${new Date(lab.date).toLocaleDateString()}): Status ${lab.status}${lab.notes ? `. Note: ${lab.notes}` : ''}`
      ).join('\n\n');
      
      return `Here are ${patient.name}'s recent lab results:\n\n${labSummary}`;
    }
    
    if (lowerMessage.includes('medication') || lowerMessage.includes('med') || lowerMessage.includes('prescription')) {
      if (patient.medications.length === 0) {
        return "This patient is not currently taking any medications.";
      }
      
      const medSummary = patient.medications.map(med => 
        `${med.name} ${med.dosage}, ${med.frequency} (started ${new Date(med.startDate).toLocaleDateString()})`
      ).join('\n');
      
      return `${patient.name} is currently taking:\n\n${medSummary}`;
    }
    
    if (lowerMessage.includes('vital') || lowerMessage.includes('bp') || lowerMessage.includes('heart rate')) {
      return `${patient.name}'s most recent vital signs:\n• Blood Pressure: ${patient.vitalSigns.bloodPressure}\n• Heart Rate: ${patient.vitalSigns.heartRate} bpm\n• Temperature: ${patient.vitalSigns.temperature}°F\n• Oxygen Saturation: ${patient.vitalSigns.oxygenSaturation}%\n• Height: ${patient.vitalSigns.height} cm\n• Weight: ${patient.vitalSigns.weight} kg`;
    }
    
    if (lowerMessage.includes('condition') || lowerMessage.includes('diagnosis') || lowerMessage.includes('problem')) {
      if (patient.conditions.length === 0) {
        return "There are no documented medical conditions for this patient.";
      }
      
      return `${patient.name} has been diagnosed with ${patient.conditions.join(' and ')}.`;
    }
    
    if (lowerMessage.includes('allerg')) {
      if (patient.allergies.length === 0 || (patient.allergies.length === 1 && patient.allergies[0].toLowerCase() === 'none known')) {
        return "This patient has no known allergies.";
      }
      
      return `${patient.name} has the following allergies: ${patient.allergies.join(', ')}.`;
    }
    
    // Default response
    return `I'm the AI medical assistant for ${patient.name}'s case. I can provide information about their medical history, current medications, lab results, vital signs, and more. How can I help you today?`;
  };
  
  // Initialize chat with welcome message when patient is selected
  useEffect(() => {
    if (selectedPatientId) {
      setMessages([
        {
          id: '1',
          content: `I'm the AI medical assistant for ${emrs[selectedPatientId].name}'s case. I can provide information about their medical history, current medications, lab results, vital signs, and more. How can I help you today?`,
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [selectedPatientId]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!input.trim() || !selectedPatientId) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate bot thinking and respond
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getMockResponse(input, selectedPatientId),
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, botResponse]);
      setIsTyping(false);
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">AI Chat Assistant</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* Patient List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="font-medium text-gray-800">Select Patient</h2>
          </div>
          
          <div className="divide-y divide-gray-200 h-full overflow-y-auto">
            {patients.map(patient => (
              <button
                key={patient.patientId}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center ${
                  selectedPatientId === patient.patientId ? 'bg-cyan-50' : ''
                }`}
                onClick={() => setSelectedPatientId(patient.patientId)}
              >
                <div className={`p-2 rounded-full mr-3 ${
                  selectedPatientId === patient.patientId ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{patient.name}</h3>
                  <p className="text-sm text-gray-500">
                    {patient.conditions.join(', ')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Chat Interface */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
          {selectedPatient ? (
            <>
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-cyan-100 text-cyan-700 p-2 rounded-full mr-3">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-medium text-gray-800">
                      AI Medical Assistant
                    </h2>
                    <p className="text-sm text-gray-500">
                      Discussing: {selectedPatient.name}
                    </p>
                  </div>
                </div>
                <button 
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    setMessages([
                      {
                        id: '1',
                        content: `I'm the AI medical assistant for ${selectedPatient.name}'s case. I can provide information about their medical history, current medications, lab results, vital signs, and more. How can I help you today?`,
                        sender: 'bot',
                        timestamp: new Date(),
                      },
                    ]);
                  }}
                >
                  <RefreshCw className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div 
                        className={`max-w-3/4 rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-cyan-600 text-white'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <div className="flex items-start">
                          {message.sender === 'bot' && (
                            <div className="bg-cyan-100 p-1 rounded-full mr-2 mt-0.5">
                              <Bot className="h-4 w-4 text-cyan-700" />
                            </div>
                          )}
                          <div>
                            <p 
                              className={message.sender === 'user' ? 'text-white' : 'text-gray-800'}
                              style={{ whiteSpace: 'pre-wrap' }}
                            >
                              {message.content}
                            </p>
                            <p className={`text-xs mt-1 flex items-center ${
                              message.sender === 'user' ? 'text-cyan-100' : 'text-gray-500'
                            }`}>
                              <Clock className="h-3 w-3 mr-1" />
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-3/4 rounded-lg p-3 bg-white border border-gray-200">
                        <div className="flex items-center space-x-2">
                          <div className="bg-cyan-100 p-1 rounded-full">
                            <Bot className="h-4 w-4 text-cyan-700" />
                          </div>
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about the patient's history, conditions, labs..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || !selectedPatientId}
                    className={`ml-2 p-2 rounded-full ${
                      input.trim() && selectedPatientId
                        ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>
                    Try asking: "Give me a summary of this patient" or "What are their latest lab results?"
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Select a Patient</h3>
                <p className="text-gray-500 max-w-md">
                  Choose a patient from the list to start a conversation with the AI Medical Assistant.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* AI capabilities info */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-5 border border-cyan-100">
        <h3 className="font-medium text-lg text-gray-800 mb-3">AI Assistant Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <div className="bg-cyan-100 p-2 rounded-full">
              <FileText className="h-5 w-5 text-cyan-700" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Data Summarization</h4>
              <p className="text-sm text-gray-600">
                Automatically condenses complex patient records into digestible summaries
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-cyan-100 p-2 rounded-full">
              <Clock className="h-5 w-5 text-cyan-700" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Real-time Access</h4>
              <p className="text-sm text-gray-600">
                Provides instant access to patient information during consultations
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-cyan-100 p-2 rounded-full">
              <Bot className="h-5 w-5 text-cyan-700" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Natural Language</h4>
              <p className="text-sm text-gray-600">
                Ask questions using conversational language for faster information retrieval
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatAssistant;