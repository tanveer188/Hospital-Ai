import React, { useState } from 'react';
import { FileText, Search, AlertCircle, ClipboardCheck, Activity } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const PatientRecords: React.FC = () => {
  const { emrs } = useAppContext();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const patients = Object.values(emrs);
  
  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get selected patient data
  const selectedPatient = selectedPatientId ? emrs[selectedPatientId] : null;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Patient Records</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="font-medium text-gray-800">Patients</h2>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-[70vh] overflow-y-auto">
              {filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
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
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{patient.name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(patient.dob).toLocaleDateString()} • {patient.gender}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No patients match your search criteria.
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Patient Details */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-medium text-gray-800">
                  Electronic Medical Record
                </h2>
                <span className="text-sm text-gray-500">
                  AI-retrieved data for {selectedPatient.name}
                </span>
              </div>
              
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Patient Overview */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Patient Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Full Name</p>
                      <p className="font-medium">{selectedPatient.name}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                      <p className="font-medium">
                        {new Date(selectedPatient.dob).toLocaleDateString()} 
                        ({new Date().getFullYear() - new Date(selectedPatient.dob).getFullYear()} years)
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Gender</p>
                      <p className="font-medium">{selectedPatient.gender}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Allergies</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedPatient.allergies.length > 0 ? (
                          selectedPatient.allergies.map(allergy => (
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
                </div>
                
                {/* Conditions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Conditions</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.conditions.map(condition => (
                      <span 
                        key={condition} 
                        className="px-3 py-1.5 bg-orange-100 text-orange-800 rounded-lg text-sm"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Medications */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Current Medications</h3>
                  <div className="space-y-3">
                    {selectedPatient.medications.map((medication, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-gray-800">{medication.name}</h4>
                          <span className="text-sm text-gray-500">
                            Started: {new Date(medication.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {medication.dosage}, {medication.frequency}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Vital Signs */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Latest Vital Signs</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center mb-1">
                        <Activity className="h-4 w-4 text-blue-600 mr-1" />
                        <p className="text-sm text-gray-600">Blood Pressure</p>
                      </div>
                      <p className="font-medium text-gray-800">{selectedPatient.vitalSigns.bloodPressure}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center mb-1">
                        <Activity className="h-4 w-4 text-blue-600 mr-1" />
                        <p className="text-sm text-gray-600">Heart Rate</p>
                      </div>
                      <p className="font-medium text-gray-800">{selectedPatient.vitalSigns.heartRate} bpm</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center mb-1">
                        <Activity className="h-4 w-4 text-blue-600 mr-1" />
                        <p className="text-sm text-gray-600">Temperature</p>
                      </div>
                      <p className="font-medium text-gray-800">{selectedPatient.vitalSigns.temperature}°F</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center mb-1">
                        <Activity className="h-4 w-4 text-blue-600 mr-1" />
                        <p className="text-sm text-gray-600">O2 Saturation</p>
                      </div>
                      <p className="font-medium text-gray-800">{selectedPatient.vitalSigns.oxygenSaturation}%</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center mb-1">
                        <Activity className="h-4 w-4 text-blue-600 mr-1" />
                        <p className="text-sm text-gray-600">Height</p>
                      </div>
                      <p className="font-medium text-gray-800">{selectedPatient.vitalSigns.height} cm</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center mb-1">
                        <Activity className="h-4 w-4 text-blue-600 mr-1" />
                        <p className="text-sm text-gray-600">Weight</p>
                      </div>
                      <p className="font-medium text-gray-800">{selectedPatient.vitalSigns.weight} kg</p>
                    </div>
                  </div>
                </div>
                
                {/* Lab Results */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Lab Results</h3>
                  <div className="space-y-4">
                    {selectedPatient.labResults.map((lab, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${
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
                        
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(lab.results).map(([key, value]) => (
                            <div key={key} className="bg-white/50 p-2 rounded border border-gray-200">
                              <p className="text-xs text-gray-500">{key}</p>
                              <p className="font-medium text-gray-800">{value}</p>
                            </div>
                          ))}
                        </div>
                        
                        {lab.notes && (
                          <div className="mt-4 p-3 bg-white/50 rounded border-l-4 border-yellow-400">
                            <p className="text-sm text-gray-700">{lab.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm flex items-center justify-center p-12 h-full">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Patient Selected</h3>
                <p className="text-gray-500 max-w-md">
                  Select a patient from the list to view their electronic medical record.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientRecords;