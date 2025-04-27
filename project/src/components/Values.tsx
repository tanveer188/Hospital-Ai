import React from 'react';
import { Shield, Award, Users, Heart, CheckCircle } from 'lucide-react';

const Values = () => {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-800 mb-2">Our Values</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Respect */}
          <div className="bg-blue-100 rounded-lg p-6 transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-center mb-4">
              <Users className="text-blue-600 w-6 h-6 mr-2" />
              <h3 className="font-bold text-blue-800 text-xl">Respect</h3>
            </div>
            <p className="text-gray-700">
              We treat all individuals with respect and dignity. We believe that every person deserves to be treated with compassion and kindness.
            </p>
          </div>
          
          {/* Excellence */}
          <div className="bg-blue-100 rounded-lg p-6 transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-center mb-4">
              <Award className="text-blue-600 w-6 h-6 mr-2" />
              <h3 className="font-bold text-blue-800 text-xl">Excellence</h3>
            </div>
            <p className="text-gray-700">
              We are committed to providing excellent care and services to our patients, continuously improving our methods and skills.
            </p>
          </div>
          
          {/* Teamwork */}
          <div className="bg-blue-100 rounded-lg p-6 transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-center mb-4">
              <Users className="text-blue-600 w-6 h-6 mr-2" />
              <h3 className="font-bold text-blue-800 text-xl">Teamwork</h3>
            </div>
            <p className="text-gray-700">
              We believe in working collaboratively with our team members and other healthcare providers to deliver effective care to our patients.
            </p>
          </div>
          
          {/* Compassion */}
          <div className="bg-blue-100 rounded-lg p-6 transition-transform hover:-translate-y-1 duration-300 md:col-start-1">
            <div className="flex items-center mb-4">
              <Heart className="text-blue-600 w-6 h-6 mr-2" />
              <h3 className="font-bold text-blue-800 text-xl">Compassion</h3>
            </div>
            <p className="text-gray-700">
              We strive to create a welcoming and supportive environment that puts our patient ease and addresses their concerns with empathy.
            </p>
          </div>
          
          {/* Health Shield (Center) */}
          <div className="flex justify-center items-center p-6 md:row-span-2">
            <div className="w-32 h-32 relative flex items-center justify-center">
              <Shield className="w-full h-full text-blue-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white font-bold text-center">
                  <span className="text-xl">HEALTH</span><br />
                  <span className="text-2xl">+</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Integrity */}
          <div className="bg-blue-100 rounded-lg p-6 transition-transform hover:-translate-y-1 duration-300 md:col-start-3">
            <div className="flex items-center mb-4">
              <CheckCircle className="text-blue-600 w-6 h-6 mr-2" />
              <h3 className="font-bold text-blue-800 text-xl">Integrity</h3>
            </div>
            <p className="text-gray-700">
              We believe in practicing medicine with integrity and honesty. We are always putting our patient interest first in everything we do.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Values;