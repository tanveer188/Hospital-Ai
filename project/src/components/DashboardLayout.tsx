import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Header from './Headers';
import Sidebar from './Sidebar';
import { useAppContext } from '../context/AppContext';

interface DashboardLayoutProps {
  role: 'doctor' | 'patient';
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser } = useAppContext();
  
  // Redirect if not logged in or wrong role
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (currentUser.role !== role) {
    return <Navigate to={`/${currentUser.role}-dashboard`} />;
  }
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 flex">
        <Sidebar 
          role={role as 'doctor' | 'patient'} 
          isOpen={sidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />
        
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;