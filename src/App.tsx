import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import OTPVerification from './pages/OTPVerification';
import Lookup from './pages/Lookup';
import Results from './pages/Results';
import Stats from './pages/Stats';
import BulkNotify from './pages/BulkNotify';
import MessagingApp from './pages/MessagingApp';

// Context
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<OTPVerification />} />
              <Route path="/lookup" element={<Lookup />} />
              <Route path="/results" element={<Results />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/bulk-notify" element={<BulkNotify />} />
              <Route path="/messaging" element={<MessagingApp />} />
            </Routes>
            <Toaster position="top-center" />
          </div>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;