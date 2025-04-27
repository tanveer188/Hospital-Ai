import React from 'react';
import { User, Settings, ShieldCheck, Bell, CreditCard, ExternalLink } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const PatientAccount: React.FC = () => {
  const { currentUser, billingInfo } = useAppContext();
  
  if (!currentUser) return null;
  
  // Mock for demo - in a real app, this would come from an authenticated user session
  const patientId = 'p1'; // For demo, always show Sarah Johnson's data
  const billing = billingInfo[patientId];
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Account</h1>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-full">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-medium">Sarah Johnson</h2>
              <p className="text-purple-100">Patient Profile</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-purple-600" />
                Personal Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text"
                    value="Sarah Johnson"
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email"
                    value="sarah@example.com"
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    type="tel"
                    value="(555) 123-4567"
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input 
                    type="text"
                    value="06/12/1985"
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>
              </div>
              
              <button className="mt-4 flex items-center text-sm text-purple-600 hover:text-purple-800">
                <Settings className="h-4 w-4 mr-1" />
                Edit Profile Information
              </button>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                Insurance Information
              </h3>
              
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 mb-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-800">{billing.insuranceProvider}</h4>
                </div>
                
                <div className="mt-3 space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">Policy Number:</span>{" "}
                    <span className="text-gray-800">{billing.policyNumber}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Group Number:</span>{" "}
                    <span className="text-gray-800">{billing.groupNumber}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Coverage:</span>{" "}
                    <span className="text-gray-800">
                      {new Date(billing.coverageStart).toLocaleDateString()} to {new Date(billing.coverageEnd).toLocaleDateString()}
                    </span>
                  </p>
                </div>
                
                <div className="mt-4 pt-3 border-t border-purple-200 flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Deductible Remaining</p>
                    <p className="font-medium text-gray-800">${billing.deductibleRemaining}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Co-pay</p>
                    <p className="font-medium text-gray-800">${billing.copay}</p>
                  </div>
                </div>
              </div>
              
              <button className="flex items-center text-sm text-purple-600 hover:text-purple-800">
                <ExternalLink className="h-4 w-4 mr-1" />
                View Insurance Portal
              </button>
              
              <h3 className="text-lg font-medium text-gray-800 mb-4 mt-6 flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-purple-600" />
                Privacy Settings
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Data Sharing</p>
                    <p className="text-sm text-gray-500">Share anonymous data for research</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" checked readOnly />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Extra security for your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-purple-600" />
              Notification Preferences
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center">
                <input 
                  id="notify-appointments"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  checked
                  readOnly
                />
                <label htmlFor="notify-appointments" className="ml-2 text-sm text-gray-700">
                  Appointment Reminders
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  id="notify-results"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  checked
                  readOnly
                />
                <label htmlFor="notify-results" className="ml-2 text-sm text-gray-700">
                  Lab Results Available
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  id="notify-messages"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  checked
                  readOnly
                />
                <label htmlFor="notify-messages" className="ml-2 text-sm text-gray-700">
                  Messages from Providers
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  id="notify-billing"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  readOnly
                />
                <label htmlFor="notify-billing" className="ml-2 text-sm text-gray-700">
                  Billing Updates
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-purple-50 rounded-lg p-5 border border-purple-100">
        <div className="flex items-start">
          <ShieldCheck className="h-5 w-5 text-purple-700 mr-3 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Your Data Privacy</h3>
            <p className="text-sm text-gray-700">
              We take your privacy seriously. Your medical information is securely stored and accessible only to you and your authorized healthcare providers. Our AI system uses state-of-the-art encryption and follows all HIPAA guidelines to ensure your data remains confidential.
            </p>
            <div className="mt-4 flex items-center">
              <a href="#" className="text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center">
                View Privacy Policy
                <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAccount;