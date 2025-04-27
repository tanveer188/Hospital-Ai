import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockAppointments, mockEMRs, mockBillingInfo, mockLifestyleTips } from '../data/mockData';

interface AppContextType {
  appointments: typeof mockAppointments;
  emrs: typeof mockEMRs;
  billingInfo: typeof mockBillingInfo;
  lifestyleTips: typeof mockLifestyleTips;
  currentUser: { id: string; role: string; name: string } | null;
  setCurrentUser: (user: { id: string; role: string; name: string } | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string; name: string } | null>(null);

  const value = {
    appointments: mockAppointments,
    emrs: mockEMRs,
    billingInfo: mockBillingInfo,
    lifestyleTips: mockLifestyleTips,
    currentUser,
    setCurrentUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};