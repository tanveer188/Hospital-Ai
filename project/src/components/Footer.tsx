import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1 - About */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-2">
                <span className="text-blue-800 font-bold text-xl">H+</span>
              </div>
              <h3 className="text-xl font-bold">Health + Lifeline</h3>
            </div>
            <p className="text-blue-200 mb-4">
              Providing exceptional healthcare services with compassion and expertise since 2005. 
              Your health is our priority.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-8 h-8 bg-blue-800 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-8 h-8 bg-blue-800 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-8 h-8 bg-blue-800 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-8 h-8 bg-blue-800 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                <Linkedin size={16} />
              </a>
            </div>
          </div>
          
          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Home</a></li>
              <li><a href="#about" className="text-blue-200 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#departments" className="text-blue-200 hover:text-white transition-colors">Departments</a></li>
              <li><a href="#doctors" className="text-blue-200 hover:text-white transition-colors">Doctors</a></li>
              <li><a href="#contact" className="text-blue-200 hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          {/* Column 3 - Departments */}
          <div>
            <h3 className="text-xl font-bold mb-4">Departments</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Cardiology</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Neurology</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Pediatrics</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Orthopedics</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Dermatology</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Laboratory</a></li>
            </ul>
          </div>
          
          {/* Column 4 - Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="text-blue-300 mt-1 mr-2 flex-shrink-0" size={18} />
                <span className="text-blue-200">123 Healthcare Blvd, Medical District, NY 10001</span>
              </li>
              <li className="flex items-center">
                <Phone className="text-blue-300 mr-2 flex-shrink-0" size={18} />
                <a href="tel:18805201666" className="text-blue-200 hover:text-white transition-colors">1880-520-1666</a>
              </li>
              <li className="flex items-center">
                <Mail className="text-blue-300 mr-2 flex-shrink-0" size={18} />
                <a href="mailto:info@healthlifeline.com" className="text-blue-200 hover:text-white transition-colors">info@healthlifeline.com</a>
              </li>
              <li className="flex items-start">
                <Clock className="text-blue-300 mt-1 mr-2 flex-shrink-0" size={18} />
                <div>
                  <p className="text-blue-200">Mon-Fri: 8:00 AM - 8:00 PM</p>
                  <p className="text-blue-200">Sat-Sun: 9:00 AM - 5:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-blue-800 text-center text-blue-300">
          <p>&copy; {new Date().getFullYear()} Health + Lifeline. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;