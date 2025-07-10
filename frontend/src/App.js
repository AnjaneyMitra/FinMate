import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { auth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from './firebase';
import Dashboard from './Dashboard';
import LandingPage from './LandingPage';
import TaxFilingDashboard from './components/TaxFilingDashboard';
import UserProfilePage from './components/UserProfilePage';
import { SidebarProvider } from './contexts/SidebarContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(true);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // User state will be updated by onAuthStateChanged
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // User state will be updated by onAuthStateChanged
    } catch (err) {
      setError(err.message);
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <ThemeProvider>
        <LoadingSpinner />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SidebarProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route 
                path="/login" 
                element={
                  user ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <LoginPage 
                      email={email}
                      setEmail={setEmail}
                      password={password}
                      setPassword={setPassword}
                      error={error}
                      isLogin={isLogin}
                      setIsLogin={setIsLogin}
                      handleAuth={handleAuth}
                      handleGoogleAuth={handleGoogleAuth}
                    />
                  )
                } 
              />
              <Route 
                path="/dashboard/*" 
                element={
                  user ? (
                    <Dashboard user={user} setUser={setUser} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
              <Route 
                path="/tax-filing/*" 
                element={
                  user ? (
                    <TaxFilingDashboard user={user} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
              <Route 
                path="/user-profile" 
                element={user ? <UserProfilePage /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/" 
                element={<LandingPage />} 
              />
            </Routes>
          </div>
        </Router>
      </SidebarProvider>
    </ThemeProvider>
  );
}

// Loading Spinner Component with theme support
function LoadingSpinner() {
  const themeContext = useTheme();
  const { bg, text, accent } = themeContext || {};
  
  // Safe fallbacks
  const safeBg = bg || { primary: 'bg-white' };
  const safeText = text || { primary: 'text-gray-900' };
  const safeAccent = accent || { primary: 'bg-teal-600' };
  
  return (
    <div className={`min-h-screen flex items-center justify-center ${safeBg.primary}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-${safeAccent.primary.replace('bg-', '')} mx-auto mb-4`}></div>
        <p className={safeText.primary}>Loading...</p>
      </div>
    </div>
  );
}

// Login Page Component with theme support
function LoginPage({ email, setEmail, password, setPassword, error, isLogin, setIsLogin, handleAuth, handleGoogleAuth }) {
  const themeContext = useTheme();
  const { bg, text, border, accent } = themeContext || {};
  
  // Safe fallbacks for theme properties
  const safeBg = bg || {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    card: 'bg-white'
  };
  const safeText = text || {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    accent: 'text-teal-600'
  };
  const safeBorder = border || {
    primary: 'border-gray-200'
  };
  const safeAccent = accent || {
    primary: 'bg-teal-600'
  };
  
  return (
    <div className={`min-h-screen flex items-center justify-center ${safeBg.secondary}`}>
      <main className={`text-center p-8 rounded-xl shadow-lg ${safeBg.card} backdrop-blur-md w-full max-w-md border ${safeBorder.primary}`}>
        <h1 className={`text-4xl md:text-5xl font-extrabold ${safeText.accent} mb-4 drop-shadow-lg`}>
          FinMate
        </h1>
        <h2 className={`text-xl md:text-2xl font-medium ${safeText.secondary} mb-6`}>
          Your Smart Finance Companion
        </h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3 py-2 border ${safeBorder.primary} rounded focus:outline-none focus:ring-2 focus:ring-${safeAccent.primary.replace('bg-', '')} ${safeBg.card} ${safeText.primary}`}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-3 py-2 border ${safeBorder.primary} rounded focus:outline-none focus:ring-2 focus:ring-${safeAccent.primary.replace('bg-', '')} ${safeBg.card} ${safeText.primary}`}
            required
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className={`w-full ${safeAccent.primary} text-white px-4 py-2 rounded hover:opacity-90 transition-opacity`}
          >
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>
        
        {/* Divider */}
        <div className="flex items-center my-4">
          <div className={`flex-grow border-t ${safeBorder.primary}`}></div>
          <span className={`flex-shrink mx-4 ${safeText.secondary} text-sm`}>or</span>
          <div className={`flex-grow border-t ${safeBorder.primary}`}></div>
        </div>

        {/* Google Sign-in Button */}
        <button
          onClick={handleGoogleAuth}
          className={`w-full ${safeBg.card} border ${safeBorder.primary} ${safeText.secondary} px-4 py-2 rounded hover:${safeBg.secondary} transition-colors flex items-center justify-center space-x-2`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <p className="text-sm mt-4">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              className={`ml-2 ${safeText.accent} underline hover:opacity-80 transition-opacity`}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
      </main>
    </div>
  );
}

export default App;
