import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockUsers } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
const PatientLogin = () => {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [success, setSuccess] = useState(false);
const [loading, setLoading] = useState(false);
const { setCurrentUser } = useAppContext();

const navigate= useNavigate()

const handlePatientLogin = () => {
    // For demo purposes, just use the first patient
    const patient = mockUsers.patients[0];
    setCurrentUser(patient);
    navigate('/patient-dashboard/*');
  };

const handleSubmit = async (e) => {

    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const loginData = { email, password };

    try {
        // Update the URL to match the backend route
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        // Check if the response is ok BEFORE trying to parse JSON
        if (!response.ok) {
            // Try to get error message from JSON if the server sends it
            let errorMessage = 'Login failed';
            try {
                const errorData = await response.json();
                if (errorData && errorData.error) {
                    errorMessage = errorData.error;
                } else if (errorData && errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (parseError) {
                // If parsing JSON fails (e.g., server sent HTML error page),
                // use the status text as a fallback.
                errorMessage = `Login failed with status: ${response.status} ${response.statusText}`;
                console.error('Error parsing error response:', parseError);
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        // Save token to localStorage
        localStorage.setItem('token', data.token);
        setSuccess(true);
        
        // Redirect or update app state here
        // Example: navigate('/dashboard');
        console.log('Login successful:', data.message);
        handlePatientLogin();
    } catch (error) {
        console.error('Error during login:', error);
        setError(error.message || 'An error occurred. Please try again.');
    } finally {
        setLoading(false);
    }
};

return (
    <div className="max-w-md mx-auto my-12 p-6 border border-gray-300 rounded-lg shadow-md text-center">
        <h2 className="mb-6 text-2xl font-semibold text-gray-800">Patient Login</h2>

        {success && (
            <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                Login successful!
            </div>
        )}

        {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="mb-4">
                <label htmlFor="email" className="block mb-1 text-sm text-gray-600">
                    Email:
                </label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-2 text-sm border border-gray-300 rounded"
                />
            </div>

            <div className="mb-6">
                <label htmlFor="password" className="block mb-1 text-sm text-gray-600">
                    Password:
                </label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-2 text-sm border border-gray-300 rounded"
                />
            </div>

            <div className="flex flex-col gap-2">
                <button
                    type="submit"
                    disabled={loading}
                    className={`p-2 text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} border-none rounded cursor-pointer`}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                <div className="mt-4 text-sm text-gray-600">
                    Don't have an account? <a href="/signup" className="text-blue-600 hover:underline">Sign up</a>
                </div>
            </div>
        </form>
    </div>
);}
export default PatientLogin;
// This code is a React component for a patient login form. It includes error handling, loading state, and success messages. The form captures email and password, sends a POST request to the backend, and handles the response accordingly. 