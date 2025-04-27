import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import AppointmentsList from '../components/doctor/AppointmentsList';
import PatientRecords from '../components/doctor/PatientRecords';
import AIChatAssistant from '../components/doctor/AIChatAssistant';
import BillingValidation from '../components/doctor/BillingValidation';
const DoctorDashboard: React.FC = () => {
  return (
    <DashboardLayout role="doctor">
      <Routes>
        <Route path="/" element={<AppointmentsList />} />
        <Route path="/records" element={<PatientRecords />} />
        <Route path="/assistant" element={<AIChatAssistant />} />
        <Route path="/billing" element={<BillingValidation />} />
        <Route path="*" element={<Navigate to="/doctor-dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DoctorDashboard;