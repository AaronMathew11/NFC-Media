import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MediaTeamRoster from './pages/MediaTeamRoster';
import ServiceFlow from './pages/ServiceFlow';
import ChurchMembers from './pages/ChurchMembers';
import ChurchResponsibilities from './pages/ChurchResponsibilities';
import EmergencyContacts from './pages/EmergencyContacts';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/media-roster" 
              element={
                <ProtectedRoute>
                  <MediaTeamRoster />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/service-flow" 
              element={
                <ProtectedRoute>
                  <ServiceFlow />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/church-members" 
              element={
                <ProtectedRoute>
                  <ChurchMembers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/church-responsibilities" 
              element={
                <ProtectedRoute>
                  <ChurchResponsibilities />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/emergency-contacts" 
              element={
                <ProtectedRoute>
                  <EmergencyContacts />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
