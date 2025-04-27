import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, User, ArrowRight } from 'lucide-react';
import Header from '../components/Headers';
import Footer from '../components/Footer';
import { useAppContext } from '../context/AppContext';
import { mockUsers } from '../data/mockData';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAppContext();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isHoveringDoctor, setIsHoveringDoctor] = useState(false);
  const [isHoveringPatient, setIsHoveringPatient] = useState(false);
  
  // For a real app, these would involve actual authentication
  const handleDoctorLogin = () => {
    // For demo purposes, just use the first doctor
    const doctor = mockUsers.doctors[0];
    setCurrentUser(doctor);
    navigate('/loginDoctore');
  };
  
  const handlePatientLogin = () => {
    // For demo purposes, just use the first patient
    const patient = mockUsers.patients[0];
    setCurrentUser(patient);
    navigate('/loginpaitents');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 bg-gradient-to-br from-cyan-700 to-teal-600 p-10 text-white">
                <h2 className="text-3xl font-bold mb-6">Welcome to HealthFlow AI</h2>
                <p className="mb-6">
                  Experience how our agentic AI framework automates hospital workflows and improves healthcare delivery.
                </p>
                <div className="border-t border-cyan-400 pt-6 mt-6">
                  <h3 className="font-semibold mb-4">This demo provides:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <div className="bg-cyan-400/20 p-1 rounded-full">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span>Role-specific dashboards</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="bg-cyan-400/20 p-1 rounded-full">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span>Simulated AI agents</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="bg-cyan-400/20 p-1 rounded-full">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span>Sample medical data</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="bg-cyan-400/20 p-1 rounded-full">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span>Automated workflow examples</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="md:w-1/2 p-10">
                <h2 className="text-2xl font-bold mb-8 text-gray-800 text-center">
                  Select Your Role
                </h2>
                
                <div className="space-y-6">
                  {/* Doctor Role Selection */}
                  <div 
                    className={`border rounded-xl p-6 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                      selectedRole === 'doctor' 
                        ? 'border-cyan-500 bg-cyan-50 shadow-md' 
                        : 'border-gray-200 hover:border-cyan-500 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedRole('doctor')}
                    onMouseEnter={() => setIsHoveringDoctor(true)}
                    onMouseLeave={() => setIsHoveringDoctor(false)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${
                        selectedRole === 'doctor' 
                          ? 'bg-cyan-500 text-white' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Stethoscope className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">Doctor / Provider</h3>
                        <p className="text-gray-500 text-sm">
                          Access patient records, appointments, and billing
                        </p>
                      </div>
                    </div>
                    
                    {(selectedRole === 'doctor' || isHoveringDoctor) && (
                      <button 
                      // onClick={handleDoctorLogin}
                      onClick={()=>window.location.href='/loginDoctore'} 
                        className={`mt-4 w-full py-2 rounded-lg text-white font-medium transition-all ${
                          selectedRole === 'doctor' 
                            ? 'bg-cyan-600 hover:bg-cyan-700' 
                            : 'bg-cyan-500 hover:bg-cyan-600'
                        }`}
                      >
                        Continue as Doctor
                      </button>
                    )}
                  </div>
                  
                  {/* Patient Role Selection */}
                  <div 
                    className={`border rounded-xl p-6 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                      selectedRole === 'patient' 
                        ? 'border-purple-500 bg-purple-50 shadow-md' 
                        : 'border-gray-200 hover:border-purple-500 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedRole('patient')}
                    onMouseEnter={() => setIsHoveringPatient(true)}
                    onMouseLeave={() => setIsHoveringPatient(false)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${
                        selectedRole === 'patient' 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">Patient</h3>
                        <p className="text-gray-500 text-sm">
                          View your medical records and personalized health tips
                        </p>
                      </div>
                    </div>
                    
                    {(selectedRole === 'patient' || isHoveringPatient) && (
                      <button 
                      // onClick={handlePatientLogin}
                      onClick={()=>window.location.href='/loginpaitents'}
                        className={`mt-4 w-full py-2 rounded-lg text-white font-medium transition-all ${
                          selectedRole === 'patient' 
                            ? 'bg-purple-600 hover:bg-purple-700' 
                            : 'bg-purple-500 hover:bg-purple-600'
                        }`}
                      >
                        Continue as Patient
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-500 text-sm text-center mt-8">
                  Note: This is a demo application. No real login required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LoginPage;