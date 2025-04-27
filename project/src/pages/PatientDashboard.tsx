import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import PatientRecords from '../components/patient/PatientRecords';
import LifestyleTips from '../components/patient/LifestyleTips';
import PatientAppointments from '../components/patient/PatientAppointments';
import PatientAccount from '../components/patient/PatientAccount';

const PatientDashboard: React.FC = () => {
  return (
    <DashboardLayout role="patient">
      <Routes>
        <Route path="/" element={<PatientRecords />} />
        <Route path="/lifestyle" element={<LifestyleTips />} />
        <Route path="/appointments" element={<PatientAppointments />} />
        <Route path="/account" element={<PatientAccount />} />
        <Route path="*" element={<Navigate to="/patient-dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default PatientDashboard;