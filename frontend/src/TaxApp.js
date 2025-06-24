import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TaxFilingDashboard from './components/TaxFilingDashboard';
import TaxLoginPage from './components/TaxLoginPage';
import { auth, onAuthStateChanged } from './firebase';
import './TaxApp.css';

function TaxApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="tax-loading-container">
        <div className="tax-loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <h2 className="tax-loading-text">Loading Indian Tax Filing System...</h2>
      </div>
    );
  }

  return (
    <Router>
      <div className="tax-app">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <TaxFilingDashboard user={user} />
              ) : (
                <TaxLoginPage />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                <TaxFilingDashboard user={user} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default TaxApp;
