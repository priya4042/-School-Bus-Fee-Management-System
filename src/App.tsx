import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import SplashScreen from './components/SplashScreen';
import LandingPage from './components/LandingPage';
import AdminLogin from './components/Auth/AdminLogin';
import AdminRegister from './components/Auth/AdminRegister';
import AdminForgotPassword from './components/Auth/AdminForgotPassword';
import ParentLogin from './components/Auth/ParentLogin';
import ParentRegister from './components/Auth/ParentRegister';
import ParentForgotPassword from './components/Auth/ParentForgotPassword';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import ParentDashboard from './components/Dashboard/ParentDashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  if (!isSplashComplete) {
    return <SplashScreen onComplete={() => setIsSplashComplete(true)} />;
  }

  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Admin Auth */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />

        {/* Parent Auth */}
        <Route path="/parent/login" element={<ParentLogin />} />
        <Route path="/parent/register" element={<ParentRegister />} />
        <Route path="/parent/forgot-password" element={<ParentForgotPassword />} />

        {/* Protected Admin Routes */}
        <Route 
          path="/admin/dashboard/*" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Protected Parent Routes */}
        <Route 
          path="/parent/dashboard/*" 
          element={
            <ProtectedRoute allowedRole="parent">
              <ParentDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
