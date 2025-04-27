import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import { AppProvider } from './context/AppContext';
import { UserRegister } from './components/UserRegister';
import LoginDoct from "./pages/LoginDoct";
import LoginPaitents from "./pages/LoadingPaitents";
function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/register" element={<UserRegister />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/loginDoctore" element={<LoginDoct/>} />
          <Route path="/loginpaitents" element={<LoginPaitents/>} />
          <Route path="/doctor-dashboard/*" element={<DoctorDashboard />} />
          <Route path="/patient-dashboard/*" element={<PatientDashboard />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;