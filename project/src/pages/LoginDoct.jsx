import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { mockUsers } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
const LoginDoct = () => {
   const navigate = useNavigate();
    const { setCurrentUser } = useAppContext();
  const [formData, setFormData] = useState({
    email:"",
    password:"",
  })

  const handleDoctorLogin = () => {
    // For demo purposes, just use the first doctor
    const doctor = mockUsers.doctors[0];
    setCurrentUser(doctor);
    navigate('/doctor-dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Form data:', formData); // Debugging line
      const response = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
      });

      const data = await response.json();
console.log(data)
      if (response.ok) {
       
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          handleDoctorLogin()
        
  }} catch(error) {
      console.error('Error during login:', error);
      alert('An error occurred. Please try again.');
  }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              id="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input

              type="password"
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              id="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="accent-cyan-600" />
              <span className="text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-cyan-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition-all font-semibold"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <a href="/register" className="text-cyan-600 hover:underline font-medium">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  title: {
    marginBottom: '20px',
    fontSize: '24px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  button: {
    padding: '10px 15px',
    fontSize: '16px',
    color: '#fff',
    backgroundColor: '#007BFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default LoginDoct;