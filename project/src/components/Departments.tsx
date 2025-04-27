import React from 'react';
import { Heart, Brain, Stethoscope, Baby, Activity, Microscope } from 'lucide-react';

const Departments = () => {
  const departments = [
    {
      id: 1,
      name: 'Emergency Medicine',
      icon: <Activity className="w-8 h-8 text-blue-600" />,
    },
    {
      id: 2,
      name: 'Pediatric',
      icon: <Baby className="w-8 h-8 text-blue-600" />,
    },
    {
      id: 3,
      name: 'Cardiology',
      icon: <Heart className="w-8 h-8 text-blue-600" />,
    },
    {
      id: 4,
      name: 'Neurology',
      icon: <Brain className="w-8 h-8 text-blue-600" />,
    },
    {
      id: 5,
      name: 'General Medicine',
      icon: <Stethoscope className="w-8 h-8 text-blue-600" />,
    },
    {
      id: 6,
      name: 'Laboratory',
      icon: <Microscope className="w-8 h-8 text-blue-600" />,
    },
  ];

  return (
    <section id="departments" className="py-16 bg-gradient-to-r from-blue-100 to-blue-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-800 mb-2">Departments</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Our hospital features specialized departments with expert healthcare professionals
            dedicated to providing comprehensive care for all your medical needs.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {departments.map((dept) => (
            <div 
              key={dept.id} 
              className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                {dept.icon}
              </div>
              <h3 className="font-semibold text-blue-800">{dept.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Departments;