import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages and Components
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BoardView from './pages/BoardView';
import TeamMembers from './pages/TeamMembers';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      {/* React Hot Toast provider */}
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'glass-effect border border-white/10 !bg-slate-900 !text-slate-100 text-sm rounded-xl',
          duration: 3000,
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/boards/:id" element={<BoardView />} />
          <Route path="/boards/:id/team" element={<TeamMembers />} />
        </Route>

        {/* Fallback routing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
