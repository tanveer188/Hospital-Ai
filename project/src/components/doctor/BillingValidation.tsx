import React, { useState } from 'react';
import { CreditCard, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const BillingValidation: React.FC = () => {
  const { billingInfo } = useAppContext();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const patients = Object.keys(billingInfo).map(id => ({
    id,
    name: billingInfo[id].insuranceProvider,
    patientName: billingInfo[id].patientId === 'p1' 
      ? 'Sarah Johnson' 
      : billingInfo[id].patientId === 'p2'
        ? 'Robert Williams'
        : 'Emma Davis',
    claimCount: billingInfo[id].recentClaims.length,
    hasIssues: billingInfo[id].recentClaims.some(claim => 
      claim.validationIssues && claim.validationIssues.length > 0
    ),
  }));
  
  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => 
    patient.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get selected patient data
  const selectedPatient = selectedPatientId ? billingInfo[selectedPatientId] : null;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Billing Validation</h1>
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
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="font-medium text-gray-800">Patient Insurance Records</h2>
          <p className="text-sm text-gray-500">
            AI automatically validates insurance information and claim status
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredPatients.length > 0 ? (
            filteredPatients.map(patient => (
              <button
                key={patient.id}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                  selectedPatientId === patient.id ? 'bg-cyan-50' : ''
                }`}
                onClick={() => setSelectedPatientId(patient.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-3 ${
                      patient.hasIssues 
                        ? 'bg-yellow-100 text-yellow-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{patient.patientName}</h3>
                      <p className="text-sm text-gray-500">
                        {patient.name} • {patient.claimCount} recent claims
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-2 sm:mt-0">
                    <span className={`
                      px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center sm:ml-2
                      ${patient.hasIssues 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                      }
                    `}>
                      {patient.hasIssues ? (
                        <>
                          <AlertCircle className="h-3.5 w-3.5 mr-1" />
                          Validation Issues
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          All Claims Valid
                        </>
                      )}
                    </span>
                  </div>
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
      
      {/* Selected Patient Details */}
      {selectedPatient && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="font-medium text-gray-800">
              Insurance Details: {
                selectedPatient.patientId === 'p1' 
                  ? 'Sarah Johnson' 
                  : selectedPatient.patientId === 'p2'
                    ? 'Robert Williams'
                    : 'Emma Davis'
              }
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Insurance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-100">
                <p className="text-sm text-gray-600 mb-1">Insurance Provider</p>
                <p className="font-medium text-gray-800">{selectedPatient.insuranceProvider}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-100">
                <p className="text-sm text-gray-600 mb-1">Policy Number</p>
                <p className="font-medium text-gray-800">{selectedPatient.policyNumber}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-100">
                <p className="text-sm text-gray-600 mb-1">Group Number</p>
                <p className="font-medium text-gray-800">{selectedPatient.groupNumber}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-100">
                <p className="text-sm text-gray-600 mb-1">Coverage Period</p>
                <p className="font-medium text-gray-800">
                  {new Date(selectedPatient.coverageStart).toLocaleDateString()} to {new Date(selectedPatient.coverageEnd).toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-100">
                <p className="text-sm text-gray-600 mb-1">Copay</p>
                <p className="font-medium text-gray-800">${selectedPatient.copay}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-100">
                <p className="text-sm text-gray-600 mb-1">Deductible Remaining</p>
                <p className="font-medium text-gray-800">${selectedPatient.deductibleRemaining}</p>
              </div>
            </div>
            
            {/* Recent Claims */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Claims</h3>
              <div className="space-y-4">
                {selectedPatient.recentClaims.map((claim, index) => (
                  <div 
                    key={claim.id} 
                    className={`p-4 rounded-lg border ${
                      claim.validationIssues && claim.validationIssues.length > 0
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {claim.service}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Date: {new Date(claim.date).toLocaleDateString()} • Claim ID: {claim.id}
                        </p>
                      </div>
                      
                      <div className="mt-2 md:mt-0">
                        <span className={`
                          px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center
                          ${claim.status === 'processed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                          }
                        `}>
                          {claim.status === 'processed' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Processed
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="p-3 bg-white rounded border border-gray-200">
                        <p className="text-xs text-gray-500">Billed Amount</p>
                        <p className="font-medium text-gray-800">${claim.billed}</p>
                      </div>
                      <div className="p-3 bg-white rounded border border-gray-200">
                        <p className="text-xs text-gray-500">Approved Amount</p>
                        <p className="font-medium text-gray-800">${claim.approved}</p>
                      </div>
                      <div className="p-3 bg-white rounded border border-gray-200">
                        <p className="text-xs text-gray-500">Insurance Paid</p>
                        <p className="font-medium text-gray-800">${claim.paid}</p>
                      </div>
                      <div className="p-3 bg-white rounded border border-gray-200">
                        <p className="text-xs text-gray-500">Patient Responsibility</p>
                        <p className="font-medium text-gray-800">${claim.patientResponsibility}</p>
                      </div>
                    </div>
                    
                    {claim.validationIssues && claim.validationIssues.length > 0 && (
                      <div className="mt-4 p-4 bg-yellow-100 rounded-lg border border-yellow-200">
                        <h5 className="font-medium text-yellow-800 mb-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Validation Issues Detected
                        </h5>
                        <ul className="list-disc pl-5 space-y-1">
                          {claim.validationIssues.map((issue, idx) => (
                            <li key={idx} className="text-sm text-yellow-800">
                              {issue}
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-yellow-800 mt-2">
                          AI has flagged these issues for your review. Please update the claim information to ensure proper processing.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* AI Billing Validation Info */}
      <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg p-5 border border-cyan-100">
        <h3 className="font-medium text-lg text-gray-800 mb-3">About AI Billing Validation</h3>
        <p className="text-sm text-gray-700 mb-4">
          Our agentic AI system automatically validates billing information to ensure accurate claims processing and minimize denials. The system checks for:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="bg-cyan-100 p-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-cyan-700" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Insurance Verification</h4>
              <p className="text-sm text-gray-600">
                Automatically verifies active coverage and policy details before submission
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-cyan-100 p-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-cyan-700" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Code Validation</h4>
              <p className="text-sm text-gray-600">
                Ensures correct procedure and diagnosis codes to prevent claim rejections
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-cyan-100 p-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-cyan-700" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Documentation Review</h4>
              <p className="text-sm text-gray-600">
                Checks that all required documentation is attached for complex claims
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-cyan-100 p-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-cyan-700" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Prior Authorization</h4>
              <p className="text-sm text-gray-600">
                Identifies services requiring prior authorization and initiates the process
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingValidation;