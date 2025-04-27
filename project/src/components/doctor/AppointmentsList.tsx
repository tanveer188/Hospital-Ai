import React, { useState } from 'react';
import { Calendar, Clock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const AppointmentsList: React.FC = () => {
  const { appointments } = useAppContext();
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'pending'>('all');
  
  // In a real app, this would come from the server for the current doctor
  const doctorId = 'd1';
  
  // Filter appointments for the current doctor
  const doctorAppointments = appointments.filter(
    appointment => appointment.doctorId === doctorId
  );
  
  // Apply filter
  const filteredAppointments = doctorAppointments.filter(appointment => {
    const today = new Date().toISOString().split('T')[0];
    
    if (filter === 'today') {
      return appointment.date === today;
    }
    if (filter === 'upcoming') {
      return appointment.date > today;
    }
    if (filter === 'pending') {
      return appointment.status === 'pending';
    }
    return true;
  });
  
  // Group appointments by date
  const appointmentsByDate = filteredAppointments.reduce<Record<string, typeof appointments>>(
    (acc, appointment) => {
      if (!acc[appointment.date]) {
        acc[appointment.date] = [];
      }
      acc[appointment.date].push(appointment);
      return acc;
    },
    {}
  );
  
  // Sort dates
  const sortedDates = Object.keys(appointmentsByDate).sort();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm rounded-full ${
              filter === 'all' 
                ? 'bg-cyan-100 text-cyan-800' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('today')}
            className={`px-3 py-1.5 text-sm rounded-full ${
              filter === 'today' 
                ? 'bg-cyan-100 text-cyan-800' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button 
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1.5 text-sm rounded-full ${
              filter === 'upcoming' 
                ? 'bg-cyan-100 text-cyan-800' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upcoming
          </button>
          <button 
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 text-sm rounded-full ${
              filter === 'pending' 
                ? 'bg-cyan-100 text-cyan-800' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-200">
        <div className="p-4 bg-gray-50 rounded-t-xl">
          <h2 className="text-lg font-medium text-gray-800">
            Upcoming Appointments ({filteredAppointments.length})
          </h2>
          <p className="text-sm text-gray-600">
            All appointments are automatically scheduled by our AI system
          </p>
        </div>
        
        {sortedDates.length > 0 ? (
          sortedDates.map(date => (
            <div key={date} className="p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-5 w-5 text-cyan-600" />
                <span className="font-medium">
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              
              <div className="space-y-3">
                {appointmentsByDate[date]
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map(appointment => (
                    <div 
                      key={appointment.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          <Clock className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {appointment.time} - {appointment.patientName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {appointment.reason}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-2 sm:mt-0">
                        <span className={`
                          px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center
                          ${appointment.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                          }
                        `}>
                          {appointment.status === 'confirmed' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          )}
                          {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No appointments match your filter criteria.</p>
          </div>
        )}
      </div>
      
      <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-100">
        <div className="flex items-start">
          <div className="mr-3 mt-0.5">
            <Calendar className="h-5 w-5 text-cyan-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-800">AI Scheduling Assistant</h3>
            <p className="text-sm text-gray-600 mt-1">
              The AI system has automatically optimized your schedule for maximum efficiency. Appointments are arranged based on patient needs, urgency, and your availability preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsList;