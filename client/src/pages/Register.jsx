import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/authSlice';
import toast from 'react-hot-toast';

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { name, email, password, confirmPassword } = formData;

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      return toast.error('Please enter all fields');
    }

    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    dispatch(registerUser({ name, email, password }));
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-appBg text-textPrimary font-sans antialiased">
      {/* Registration Card */}
      <div className="w-full max-w-md p-8 border rounded-card bg-cardBg border-borderSep z-10 mx-4">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link to="/" className="flex items-center gap-2.5 mb-4 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-btn bg-accent shadow-sm transform group-hover:rotate-6 transition-transform">
              <span className="font-extrabold text-white text-base">T</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-textPrimary">TaskFlow</span>
          </Link>
          <h2 className="text-2xl font-semibold text-textPrimary mb-1.5 tracking-tight">Get Started</h2>
          <p className="text-xs text-textMuted">Join TaskFlow and collaborate with your team</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name input */}
          <div className="space-y-1">
            <label htmlFor="name" className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 rounded-input bg-appBg border border-borderSep focus:border-accent focus:outline-none text-textPrimary text-sm placeholder-textMuted/40 transition-all duration-200"
              required
            />
          </div>

          {/* Email input */}
          <div className="space-y-1">
            <label htmlFor="email" className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-4 py-2.5 rounded-input bg-appBg border border-borderSep focus:border-accent focus:outline-none text-textPrimary text-sm placeholder-textMuted/40 transition-all duration-200"
              required
            />
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label htmlFor="password" className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className="w-full px-4 py-2.5 rounded-input bg-appBg border border-borderSep focus:border-accent focus:outline-none text-textPrimary text-sm placeholder-textMuted/40 transition-all duration-200"
              required
            />
          </div>

          {/* Confirm Password input */}
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              className="w-full px-4 py-2.5 rounded-input bg-appBg border border-borderSep focus:border-accent focus:outline-none text-textPrimary text-sm placeholder-textMuted/40 transition-all duration-200"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 mt-4 rounded-btn text-xs font-semibold bg-accent hover:bg-accent/90 text-white disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Redirection text */}
        <div className="mt-6 text-center text-xs text-textMuted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent hover:text-accent/80 hover:underline transition-all">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
