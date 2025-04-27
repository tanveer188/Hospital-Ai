import React from 'react';
import { Calendar, Clock, User, Building, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const PatientAppointments: React.FC = () => {
  const { currentUser, appointments } = useAppContext();
  
  if (!currentUser) return null;
  
  // Mock for demo - in a real app, this would come from an authenticated user session
  const patientId = 'p1'; // For demo, always show Sarah Johnson's data
  
  // Filter appointments for the current patient
  const patientAppointments = appointments.filter(
    appointment => appointment.patientId === patientId
  );
  
  // Sort appointments by date
  const sortedAppointments = [...patientAppointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Group appointments by status (upcoming vs. past)
  const today = new Date().toISOString().split('T')[0];
  const upcomingAppointments = sortedAppointments.filter(
    appointment => appointment.date >= today
  );
  const pastAppointments = sortedAppointments.filter(
    appointment => appointment.date < today
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
        <button 
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
          onClick={() => {/* Add your booking logic here */}}
        >
          <Plus className="h-5 w-5 mr-2" />
          Book Appointment
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6" />
            <h2 className="text-xl font-medium">Upcoming Appointments</h2>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(appointment => (
              <div key={appointment.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 text-purple-700 rounded-full">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.time} - {appointment.reason}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <span className={`
                      px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center
                      ${appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                      }
                    `}>
                      {appointment.status === 'confirmed' ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Confirmed
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
                
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-1 text-gray-400" />
                    <span>Doctor: {appointment.doctorName}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Building className="h-4 w-4 mr-1 text-gray-400" />
                    <span>Medical Center</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">No upcoming appointments scheduled.</p>
              <button className="mt-3 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                Request Appointment
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-100 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-800">Past Appointments</h2>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {pastAppointments.length > 0 ? (
            pastAppointments.map(appointment => (
              <div key={appointment.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 text-gray-500 rounded-full">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.time} - {appointment.reason}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 inline-flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-1 text-gray-400" />
                    <span>Doctor: {appointment.doctorName}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Building className="h-4 w-4 mr-1 text-gray-400" />
                    <span>Medical Center</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">No past appointment records found.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-5 border border-indigo-100">
        <h3 className="font-medium text-lg text-gray-800 mb-3">About AI Appointment Scheduling</h3>
        <p className="text-sm text-gray-700 mb-4">
          Our AI scheduling system automatically manages your appointments based on:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-start space-x-3">
            <div className="bg-indigo-100 p-2 rounded-full">
              <Clock className="h-5 w-5 text-indigo-700" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Optimal Timing</h4>
              <p className="text-sm text-gray-600">
                AI analyzes your past visit patterns, travel time, and schedule preferences
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-indigo-100 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-indigo-700" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Care Coordination</h4>
              <p className="text-sm text-gray-600">
                Automatically schedules follow-ups based on your treatment plans
              </p>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-700">
          Need to reschedule? Our AI system will automatically suggest new times that work for both you and your provider while ensuring timely care.
        </p>
      </div>
    </div>
  );
};

export default PatientAppointments;