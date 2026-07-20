import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Splash from './components/Splash';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Messenger from './components/Messenger';
import Community from './components/Community';
import Profile from './components/Profile';
import Navbar from './components/Navbar';
import Shop from './components/Shop';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-tea-green/20">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

import Footer from './components/Footer';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-tea-green/5 flex flex-col">
      {user && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/community" 
            element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/messenger" 
            element={
              <ProtectedRoute>
                <Messenger />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/:uid" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/shop" 
            element={
              <ProtectedRoute>
                <Shop />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      {user && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppRoutes />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
