import React, { useState } from 'react';
import { Calendar, Clock, Phone, User } from 'lucide-react';

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    department: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the form data to a server
    console.log('Form submitted:', formData);
    alert('Appointment request submitted! We will contact you shortly.');
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      department: '',
      message: ''
    });
  };

  return (
    <section id="contact" className="py-16 bg-blue-50 relative overflow-hidden">
      <div className="absolute right-0 bottom-0 opacity-10">
        <img 
          src="https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg?auto=compress&cs=tinysrgb&w=600" 
          alt="Background" 
          className="w-96 h-96 object-cover rounded-tl-full"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Left Column */}
            <div className="md:col-span-2 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-blue-800 mb-6">
                Don't Let Your Health<br />
                Take a Backseat!
              </h2>
              <p className="text-gray-700 mb-8">
                Schedule an appointment with our experienced medical professionals today and take the first step towards better health and wellbeing.
              </p>
              
              <div className="rounded-lg bg-white p-6 shadow-lg mb-6">
                <img 
                  src="https://images.pexels.com/photos/5214949/pexels-photo-5214949.jpeg?auto=compress&cs=tinysrgb&w=600" 
                  alt="Doctor" 
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
                />
                <div className="text-center">
                  <p className="text-blue-800 font-bold">Need Help?</p>
                  <a href="tel:18805201666" className="text-blue-600 font-semibold text-lg flex items-center justify-center">
                    <Phone size={16} className="mr-2" />
                    1880-520-1666
                  </a>
                </div>
              </div>
            </div>
            
            {/* Right Column - Form */}
            <div className="md:col-span-3 bg-white rounded-lg shadow-xl p-6 md:p-8">
              <h3 className="text-2xl font-bold text-blue-800 mb-6">Book An Appointment</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your Name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your Email"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your Phone"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="department" className="block text-gray-700 mb-1">Department</label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="cardiology">Cardiology</option>
                      <option value="neurology">Neurology</option>
                      <option value="pediatrics">Pediatrics</option>
                      <option value="orthopedics">Orthopedics</option>
                      <option value="dermatology">Dermatology</option>
                      <option value="general">General Medicine</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="date" className="block text-gray-700 mb-1">Preferred Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="time" className="block text-gray-700 mb-1">Preferred Time</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="time"
                        id="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="message" className="block text-gray-700 mb-1">Message (Optional)</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please share any specific concerns or questions"
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
                >
                  BOOK APPOINTMENT
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppointmentForm;