import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  FileText,
  CreditCard,
  HeartPulse,
  User,
  MessageSquare,
  Menu,
  X
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  role: 'doctor' | 'patient';
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAppContext();

  // 🔐 Get user from localStorage safely
  const storedUser = localStorage.getItem('user');
  let userInfo: any = null;

  try {
    userInfo = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
  }
console.log(userInfo.first_name)
  const doctorLinks = [
    {
      name: 'Appointments',
      path: '/doctor-dashboard',
      icon: <Calendar className="h-5 w-5" />
    },
    {
      name: 'Patient Records',
      path: '/doctor-dashboard/records',
      icon: <FileText className="h-5 w-5" />
    },
    {
      name: 'AI Assistant',
      path: '/doctor-dashboard/assistant',
      icon: <MessageSquare className="h-5 w-5" />
    },
    {
      name: 'Billing Validation',
      path: '/doctor-dashboard/billing',
      icon: <CreditCard className="h-5 w-5" />
    }
  ];

  const patientLinks = [
    {
      name: 'My Records',
      path: '/patient-dashboard',
      icon: <FileText className="h-5 w-5" />
    },
    {
      name: 'Lifestyle Tips',
      path: '/patient-dashboard/lifestyle',
      icon: <HeartPulse className="h-5 w-5" />
    },
    {
      name: 'Appointments',
      path: '/patient-dashboard/appointments',
      icon: <Calendar className="h-5 w-5" />
    },
    {
      name: 'Account',
      path: '/patient-dashboard/account',
      icon: <User className="h-5 w-5" />
    }
  ];

  const links = role === 'doctor' ? doctorLinks : patientLinks;
  const basePathname = role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard';

  const isActive = (path: string) => {
    if (path === basePathname) {
      return location.pathname === path;
    }
    return location.pathname.includes(path);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0
        `}
      >
        <div className="h-full flex flex-col">
          <button className="absolute top-4 right-4 md:hidden" onClick={toggleSidebar}>
            <X className="h-6 w-6 text-gray-500" />
          </button>

          {/* User Info */}
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-full ${
                  role === 'doctor' ? 'bg-cyan-100 text-cyan-600' : 'bg-purple-100 text-purple-600'
                }`}
              >
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {userInfo?.first_name || 'Guest'} {userInfo?.last_name || ''}
                </p>
                <p className="text-sm text-gray-500 capitalize">{userInfo.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-6 px-4 overflow-y-auto">
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.path}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(link.path);
                      if (window.innerWidth < 768) {
                        toggleSidebar();
                      }
                    }}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(link.path)
                        ? role === 'doctor'
                          ? 'bg-cyan-100 text-cyan-800'
                          : 'bg-purple-100 text-purple-800'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* System Info */}
          <div className="p-4 border-t border-gray-200">
            <div
              className={`p-4 rounded-lg ${
                role === 'doctor' ? 'bg-cyan-50' : 'bg-purple-50'
              }`}
            >
              <p className="text-sm font-medium mb-1 text-gray-800">AI System Status</p>
              <div className="flex items-center">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                <p className="text-xs text-gray-600">All systems operational</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        className="fixed bottom-6 left-6 z-10 md:hidden bg-white p-3 rounded-full shadow-lg"
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>
    </>
  );
};

export default Sidebar;
