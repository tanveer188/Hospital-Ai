import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, Linkedin, Youtube, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
              H
            </div>
            <span className="text-blue-600 font-bold text-lg md:text-2xl hidden md:inline">Health + Lifeline</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {['Home', 'About', 'Departments', 'Doctors', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Buttons */}
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-blue-600 border border-blue-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-50 transition"
            >
              Sign Up
            </button>

            {/* Emergency & Contact */}
            <div className="hidden md:flex flex-col items-end text-sm font-semibold text-blue-600 ml-4">
              <span className="bg-blue-100 px-3 py-1 rounded-full">EMERGENCY: 1666</span>
              <span className="text-right">1880-520-1666</span>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-blue-800" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white mt-3 p-4 rounded-lg shadow-lg space-y-4">
            <nav className="flex flex-col space-y-3">
              {['Home', 'About', 'Departments', 'Doctors', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="font-medium text-gray-800 hover:text-blue-600 transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>

            <div className="flex flex-col space-y-2 mt-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 text-white py-2 rounded-full text-sm font-semibold"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full bg-white border border-blue-600 text-blue-600 py-2 rounded-full text-sm font-semibold"
              >
                Sign Up
              </button>
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <div className="flex items-center space-x-3">
                {[Facebook, Youtube, Instagram, Linkedin].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="text-blue-800 hover:text-blue-600 transition-colors"
                  >
                    <Icon size={20} />
                  </a>
                ))}
              </div>
              <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                EMERGENCY: 1666
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
