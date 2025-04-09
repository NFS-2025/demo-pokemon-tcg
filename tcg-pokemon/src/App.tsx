import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Collection } from './pages/Collection';
import { DeckProvider } from "./context/DeckContext";
import Battle from "./pages/Battle";
import Profile from './pages/Profile';
import { Toaster } from "react-hot-toast";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <DeckProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Toaster />
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/collection"
              element={
                <PrivateRoute>
                  <Collection />
                </PrivateRoute>
              }
            />
            <Route
              path="/battle"
              element={
                <PrivateRoute>
                  <Battle />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
      </DeckProvider>
    </AuthProvider>
  );
}

export default App;