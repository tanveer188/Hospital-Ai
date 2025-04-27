import React, { useState } from 'react';
import { FileText, Activity, AlertCircle, ClipboardCheck } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const PatientRecords: React.FC = () => {
  const { currentUser, emrs } = useAppContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'medications' | 'labResults'>('overview');
  
  if (!currentUser) return null;
  
  // Mock for demo - in a real app, this would come from an authenticated user session
  const patientId = 'p1'; // For demo, always show Sarah Johnson's data
  const patientData = emrs[patientId];
  
  if (!patientData) return null;
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Medical Records</h1>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-medium">Welcome, {patientData.name}</h2>
              <p className="text-purple-100 mt-1">
                Here's your complete health record, secured and accessible anytime
              </p>
            </div>
            <div className="flex items-center space-x-2 mt-3 md:mt-0">
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                Last updated: Today
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-b-2 border-purple-500 text-purple-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Patient Overview
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'medications'
                  ? 'border-b-2 border-purple-500 text-purple-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('medications')}
            >
              Medications
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'labResults'
                  ? 'border-b-2 border-purple-500 text-purple-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('labResults')}
            >
              Lab Results
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Full Name</p>
                  <p className="font-medium">{patientData.name}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                  <p className="font-medium">
                    {new Date(patientData.dob).toLocaleDateString()} 
                    ({new Date().getFullYear() - new Date(patientData.dob).getFullYear()} years)
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Gender</p>
                  <p className="font-medium">{patientData.gender}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Allergies</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {patientData.allergies.length > 0 ? (
                      patientData.allergies.map(allergy => (
                        <span key={allergy} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          {allergy}
                        </span>
                      ))
                    ) : (
                      <span>None reported</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Conditions */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Medical Conditions</h3>
                <div className="flex flex-wrap gap-2">
                  {patientData.conditions.map(condition => (
                    <span 
                      key={condition} 
                      className="px-3 py-1.5 bg-orange-100 text-orange-800 rounded-lg text-sm"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Latest Vitals */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Latest Vital Signs</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center mb-1">
                      <Activity className="h-4 w-4 text-purple-600 mr-1" />
                      <p className="text-sm text-gray-600">Blood Pressure</p>
                    </div>
                    <p className="font-medium text-gray-800">{patientData.vitalSigns.bloodPressure}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center mb-1">
                      <Activity className="h-4 w-4 text-purple-600 mr-1" />
                      <p className="text-sm text-gray-600">Heart Rate</p>
                    </div>
                    <p className="font-medium text-gray-800">{patientData.vitalSigns.heartRate} bpm</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center mb-1">
                      <Activity className="h-4 w-4 text-purple-600 mr-1" />
                      <p className="text-sm text-gray-600">Temperature</p>
                    </div>
                    <p className="font-medium text-gray-800">{patientData.vitalSigns.temperature}°F</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center mb-1">
                      <Activity className="h-4 w-4 text-purple-600 mr-1" />
                      <p className="text-sm text-gray-600">O2 Saturation</p>
                    </div>
                    <p className="font-medium text-gray-800">{patientData.vitalSigns.oxygenSaturation}%</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center mb-1">
                      <Activity className="h-4 w-4 text-purple-600 mr-1" />
                      <p className="text-sm text-gray-600">Height</p>
                    </div>
                    <p className="font-medium text-gray-800">{patientData.vitalSigns.height} cm</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center mb-1">
                      <Activity className="h-4 w-4 text-purple-600 mr-1" />
                      <p className="text-sm text-gray-600">Weight</p>
                    </div>
                    <p className="font-medium text-gray-800">{patientData.vitalSigns.weight} kg</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'medications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Current Medications</h3>
              <div className="space-y-4">
                {patientData.medications.map((medication, index) => (
                  <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-gray-800">{medication.name}</h4>
                      <span className="text-sm text-gray-500">
                        Started: {new Date(medication.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {medication.dosage}, {medication.frequency}
                    </p>
                    
                    <div className="mt-4 p-3 bg-white rounded-lg text-sm">
                      <p className="font-medium text-gray-700 mb-1">AI Medication Information:</p>
                      <p className="text-gray-600">
                        This medication is used to treat {patientData.conditions[index % patientData.conditions.length]}. 
                        Take as prescribed and report any unusual side effects to your doctor.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mt-6">
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-800">Medication Management</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Always take medications as prescribed. If you experience any side effects or have questions about your medications, please contact your healthcare provider. Don't stop taking prescriptions without consulting your doctor first.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'labResults' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Lab Results</h3>
              <div className="space-y-6">
                {patientData.labResults.map((lab, index) => (
                  <div key={index} className={`p-5 rounded-lg border ${
                    lab.status === 'normal' ? 'bg-green-50 border-green-100' : 'bg-yellow-50 border-yellow-100'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">{lab.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Date: {new Date(lab.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        lab.status === 'normal' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {lab.status === 'normal' ? (
                          <div className="flex items-center">
                            <ClipboardCheck className="h-3 w-3 mr-1" />
                            Normal
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Abnormal
                          </div>
                        )}
                      </span>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(lab.results).map(([key, value]) => (
                        <div key={key} className="bg-white p-3 rounded border border-gray-200">
                          <p className="text-xs text-gray-500">{key}</p>
                          <p className="font-medium text-gray-800">{value}</p>
                        </div>
                      ))}
                    </div>
                    
                    {lab.notes && (
                      <div className="mt-4 p-3 bg-white rounded border-l-4 border-yellow-400">
                        <p className="text-sm text-gray-700">{lab.notes}</p>
                      </div>
                    )}
                    
                    <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="font-medium text-gray-800 mb-2">AI Interpretation:</h5>
                      <p className="text-sm text-gray-600">
                        {lab.status === 'normal' ? (
                          'These results are within normal ranges and do not indicate any immediate health concerns. Continue with your current health management plan.'
                        ) : (
                          'Some values are outside the normal range. This may indicate elevated blood glucose levels. Your healthcare provider may want to discuss adjustments to your treatment plan.'
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mt-6">
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-800">Understanding Your Results</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Lab results are an important part of monitoring your health. Our AI system provides general interpretations, but always discuss your results with your healthcare provider for personalized advice.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-5 border border-purple-100">
        <h3 className="font-medium text-lg text-gray-800 mb-2">About Your Medical Records</h3>
        <p className="text-sm text-gray-700 mb-4">
          Your electronic medical record (EMR) is securely managed by our AI system, ensuring your health information is always accurate and accessible. Our platform:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start">
            <div className="bg-purple-100 p-1 rounded-full mt-0.5 mr-2">
              <FileText className="h-4 w-4 text-purple-700" />
            </div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Updates automatically</span> with new test results and doctor's notes
            </p>
          </li>
          <li className="flex items-start">
            <div className="bg-purple-100 p-1 rounded-full mt-0.5 mr-2">
              <FileText className="h-4 w-4 text-purple-700" />
            </div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Highlights important information</span> to help you understand your health status
            </p>
          </li>
          <li className="flex items-start">
            <div className="bg-purple-100 p-1 rounded-full mt-0.5 mr-2">
              <FileText className="h-4 w-4 text-purple-700" />
            </div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Maintains privacy</span> with strict security protocols and controlled access
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PatientRecords;