import React from 'react';
import { ChevronRight } from 'lucide-react';
import HexagonPattern from './HexagonPattern';

const Hero = () => {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <HexagonPattern className="absolute top-0 left-0 w-full h-[90%] opacity-20 z-0" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
              Your Partner in<br />
              <span className="text-blue-700">Health and Wellness</span>
            </h1>
            <p className="text-lg text-gray-700 mb-8 max-w-md">
              We are committed to providing you with the best medical and
              healthcare services to help you live healthier and happier.
            </p>
            
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-300 flex items-center group">
              BOOK AN APPOINTMENT
              <ChevronRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="mt-10 bg-white/80 backdrop-blur-sm rounded-full py-2 px-4 flex items-center shadow-md w-max">
              <div className="flex -space-x-2 mr-3">
                <img src="https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=1" className="w-8 h-8 rounded-full border-2 border-white" alt="Patient" />
                <img src="https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=1" className="w-8 h-8 rounded-full border-2 border-white" alt="Patient" />
                <img src="https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=1" className="w-8 h-8 rounded-full border-2 border-white" alt="Patient" />
              </div>
              <div>
                <span className="text-blue-900 font-bold text-lg">50K+</span>
                <span className="text-sm text-gray-600 ml-1">Patients Recover</span>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 relative">
            <img 
              src=""
              className=" h-[20%] rounded-lg shadow-xl"
            />
            <div className="absolute -bottom-5 -left-5 md:-bottom-8 md:-left-8 bg-blue-50 p-3 md:p-5 rounded-lg shadow-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-2">
                  H+
                </div>
                <div>
                  <p className="text-blue-900 font-bold text-sm md:text-base">Health + Lifeline</p>
                  <p className="text-gray-600 text-xs">Your trusted healthcare provider</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;