import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Values from '../components/Values';
import Departments from '../components/Departments';
import Doctors from '../components/Doctors';
import AppointmentForm from '../components/AppointmentForm';
import Footer from '../components/Footer';

function LandingPage() {
  return (
    <div className="min-h-[20%] bg-gradient-to-br from-blue-100 to-blue-200">
      <Header />
      <main>
        <Hero />
        <Values />
        <Departments />
        <Doctors />
        <AppointmentForm />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;