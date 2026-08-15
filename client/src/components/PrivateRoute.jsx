import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

function PrivateRoute() {
  const { user } = useSelector((state) => state.auth);

  // If user is logged in, render the child routes (via Outlet)
  // Otherwise, redirect to login page
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default PrivateRoute;
