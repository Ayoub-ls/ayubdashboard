import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SuperAdminPanel from './pages/SuperAdminPanel';
import ClientDashboard from './pages/ClientDashboard';

// Protected Route for Super Admin
function SuperRoute({ children }) {
  const isSuperAuthed = sessionStorage.getItem("super_authed") === "true";
  if (!isSuperAuthed) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Protected Route for Client Dashboard
function ClientRoute({ children }) {
  const clientId = sessionStorage.getItem("client_id");
  if (!clientId) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route 
        path="/super" 
        element={
          <SuperRoute>
            <SuperAdminPanel />
          </SuperRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ClientRoute>
            <ClientDashboard />
          </ClientRoute>
        } 
      />
      {/* Fallback to login page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
