import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, User, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Headers: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAppContext();
  const storedUser = localStorage.getItem('user');
  let userInfo: any = null;

  try {
    userInfo = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
  }


  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <header className="bg-gradient-to-r from-cyan-700 to-teal-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
              H
            </div>
            <span className="text-white-600 font-bold text-lg md:text-2xl hidden md:inline">Health + Lifeline</span>
          </div>

        {/* Right Side */}
        {currentUser ? (
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <User className="h-5 w-5" />
              <span className="font-medium">
                {userInfo.first_name} {userInfo.last_name}
                <span className="text-cyan-100 ml-1 text-xs font-light">
                  ({userInfo.role})
                </span>
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium transition"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            {/* Sign In */}
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-teal-700 hover:bg-cyan-50 px-4 py-2 rounded-full text-sm font-semibold transition"
            >
              Sign In
            </button>

            {/* Sign Up */}
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-teal-700 hover:bg-cyan-50 px-4 py-2 rounded-full text-sm font-semibold transition"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Headers;
