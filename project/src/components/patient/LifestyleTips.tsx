import React from 'react';
import { 
  HeartPulse, 
  Utensils, 
  Dumbbell, 
  Check, 
  X, 
  AlertCircle,
  Clock,
  Brain,
  Calendar
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const LifestyleTips: React.FC = () => {
  const { currentUser, emrs, lifestyleTips } = useAppContext();
  
  if (!currentUser) return null;
  
  // Mock for demo - in a real app, this would come from an authenticated user session
  const patientId = 'p1'; // For demo, always show Sarah Johnson's data
  const patientData = emrs[patientId];
  const tipsData = lifestyleTips[patientId];
  
  if (!patientData || !tipsData) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Personalized Lifestyle Recommendations</h1>
        <div className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          Updated today
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
          <div className="flex items-center space-x-3">
            <HeartPulse className="h-6 w-6" />
            <h2 className="text-xl font-medium">Your Health Profile</h2>
          </div>
          <p className="mt-2 text-teal-50">
            AI-generated recommendations based on your specific health conditions and medical history
          </p>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {tipsData.conditions.map((condition, index) => (
              <div key={index} className="bg-white/20 px-4 py-2 rounded-lg">
                <p className="font-medium text-white">{condition}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-6 space-y-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-teal-100 rounded-full">
                <Utensils className="h-5 w-5 text-teal-700" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">Diet Recommendations</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-green-100 rounded-lg overflow-hidden">
                <div className="bg-green-50 px-4 py-3 border-b border-green-100">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-medium text-green-800">Do's</h4>
                  </div>
                </div>
                <ul className="p-4 space-y-3">
                  {tipsData.recommendations.diet.dos.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-green-100 p-1 rounded-full mt-0.5 mr-2">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <p className="text-gray-700 text-sm">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border border-red-100 rounded-lg overflow-hidden">
                <div className="bg-red-50 px-4 py-3 border-b border-red-100">
                  <div className="flex items-center">
                    <X className="h-5 w-5 text-red-600 mr-2" />
                    <h4 className="font-medium text-red-800">Don'ts</h4>
                  </div>
                </div>
                <ul className="p-4 space-y-3">
                  {tipsData.recommendations.diet.donts.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-red-100 p-1 rounded-full mt-0.5 mr-2">
                        <X className="h-3 w-3 text-red-600" />
                      </div>
                      <p className="text-gray-700 text-sm">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-full">
                <Dumbbell className="h-5 w-5 text-indigo-700" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">Exercise Recommendations</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-green-100 rounded-lg overflow-hidden">
                <div className="bg-green-50 px-4 py-3 border-b border-green-100">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-medium text-green-800">Do's</h4>
                  </div>
                </div>
                <ul className="p-4 space-y-3">
                  {tipsData.recommendations.exercise.dos.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-green-100 p-1 rounded-full mt-0.5 mr-2">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <p className="text-gray-700 text-sm">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border border-red-100 rounded-lg overflow-hidden">
                <div className="bg-red-50 px-4 py-3 border-b border-red-100">
                  <div className="flex items-center">
                    <X className="h-5 w-5 text-red-600 mr-2" />
                    <h4 className="font-medium text-red-800">Don'ts</h4>
                  </div>
                </div>
                <ul className="p-4 space-y-3">
                  {tipsData.recommendations.exercise.donts.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-red-100 p-1 rounded-full mt-0.5 mr-2">
                        <X className="h-3 w-3 text-red-600" />
                      </div>
                      <p className="text-gray-700 text-sm">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-full">
                {Object.keys(tipsData.recommendations)[2] === 'monitoring' ? (
                  <Calendar className="h-5 w-5 text-blue-700" />
                ) : (
                  <Brain className="h-5 w-5 text-blue-700" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-800">
                {Object.keys(tipsData.recommendations)[2] === 'monitoring' 
                  ? 'Health Monitoring' 
                  : Object.keys(tipsData.recommendations)[2] === 'environment'
                    ? 'Environment Recommendations'
                    : 'Lifestyle Management'}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-green-100 rounded-lg overflow-hidden">
                <div className="bg-green-50 px-4 py-3 border-b border-green-100">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-medium text-green-800">Do's</h4>
                  </div>
                </div>
                <ul className="p-4 space-y-3">
                  {tipsData.recommendations[Object.keys(tipsData.recommendations)[2]].dos.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-green-100 p-1 rounded-full mt-0.5 mr-2">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <p className="text-gray-700 text-sm">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border border-red-100 rounded-lg overflow-hidden">
                <div className="bg-red-50 px-4 py-3 border-b border-red-100">
                  <div className="flex items-center">
                    <X className="h-5 w-5 text-red-600 mr-2" />
                    <h4 className="font-medium text-red-800">Don'ts</h4>
                  </div>
                </div>
                <ul className="p-4 space-y-3">
                  {tipsData.recommendations[Object.keys(tipsData.recommendations)[2]].donts.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-red-100 p-1 rounded-full mt-0.5 mr-2">
                        <X className="h-3 w-3 text-red-600" />
                      </div>
                      <p className="text-gray-700 text-sm">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-800 mb-2">How These Recommendations Were Generated</h3>
            <p className="text-sm text-gray-700">
              These personalized recommendations are generated by our AI system based on your specific health conditions, medication history, lab results, and established clinical guidelines. While they are tailored to your situation, always consult with your healthcare provider before making significant lifestyle changes.
            </p>
            <p className="text-sm text-gray-700 mt-2">
              The AI analyzes your electronic medical record to identify the most effective strategies for managing your conditions and improving your overall health. These recommendations are updated automatically whenever new information is added to your medical record.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifestyleTips;