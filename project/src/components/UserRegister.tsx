import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  alternatePhone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export const UserRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    alternatePhone: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert('User registered successfully!');
        navigate('/');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    }
  };

  const StepIndicator = () => (
    <div className="flex justify-center mb-8 space-x-4">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
            step === s ? 'bg-teal-600' : 'bg-gray-300'
          }`}
        >
          {s}
        </div>
      ))}
    </div>
  );

  return (
   

    <div className="min-h-screen bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-10">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Register</h2>
        <StepIndicator step={step} />
  
        <form onSubmit={handleSubmit} className="space-y-10 mt-10">
          {/* Step 1 */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
              <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" required>
                <option value="">Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" required>
                <option value="">Role</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
          )}
  
          {/* Step 2 */}
          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
              <input type="tel" name="alternatePhone" placeholder="Alternate Phone" value={formData.alternatePhone} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
              <input type="text" name="street" placeholder="Street" value={formData.street} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              <input type="text" name="zipCode" placeholder="Zip Code" value={formData.zipCode} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
          )}
  
          {/* Step 3 */}
          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
              <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
            </div>
          )}
  
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button type="button" onClick={handleBack} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all">
                Back
              </button>
            )}
            {step < 3 ? (
              <button type="button" onClick={handleNext} className="ml-auto px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all">
                Next
              </button>
            ) : (
              <button type="submit" className="ml-auto px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all">
                Register
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
  
};

