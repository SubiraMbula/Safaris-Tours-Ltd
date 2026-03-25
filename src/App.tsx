import React, { useState, useEffect } from 'react';
import { 
  HashRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { AuthGuard } from './components/AuthGuard';
import { RoleRedirect } from './components/RoleRedirect';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Leads from './pages/Leads';
import Tours from './pages/Tours';
import Bookings from './pages/Bookings';
import Complaints from './pages/Complaints';

import Reports from './pages/Reports';
import Marketing from './pages/Marketing';
import Help from './pages/Help';

import { ErrorBoundary } from './components/ErrorBoundary';

import LandingPage from './pages/LandingPage';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Protected CRM Routes */}
            <Route
              path="/admin/*"
              element={
                <AuthGuard>
                  <Routes>
                    <Route element={<Layout />}>
                      <Route path="/" element={<RoleRedirect />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/leads" element={<Leads />} />
                      <Route path="/tours" element={<Tours />} />
                      <Route path="/bookings" element={<Bookings />} />
                      <Route path="/complaints" element={<Complaints />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/marketing" element={<Marketing />} />
                      <Route path="/help" element={<Help />} />
                      <Route path="*" element={<Navigate to="/admin" replace />} />
                    </Route>
                  </Routes>
                </AuthGuard>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
