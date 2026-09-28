import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GroundFixAssistant } from './components/GroundFixAssistant';

import { Home } from './pages/Home';
import { ReportHazard } from './pages/ReportHazard';
import { TrackComplaint } from './pages/TrackComplaint';
import { RoadSafetyMap } from './pages/RoadSafetyMap';
import { DriverMode } from './pages/DriverMode';
import { RoadHealth } from './pages/RoadHealth';
import { OfficerDashboard } from './pages/OfficerDashboard';

import './styles/theme.css';

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/report" element={<ReportHazard />} />
                <Route path="/track" element={<TrackComplaint />} />
                <Route path="/track/:complaintId" element={<TrackComplaint />} />
                <Route path="/map" element={<RoadSafetyMap />} />
                <Route path="/driver" element={<DriverMode />} />
                <Route path="/roads" element={<RoadHealth />} />
                <Route path="/officer" element={<OfficerDashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <GroundFixAssistant />
            <Footer />
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
