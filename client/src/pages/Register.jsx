import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/authSlice';
import toast from 'react-hot-toast';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { name, email, password, confirmPassword } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, loading, error, success } = useSelector((state) => state.auth);

  useEffect(() => {
    // Clear any previous slice errors when loading the registration screen
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }

    if (success || user) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    }
  }, [error, success, user, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      return toast.error('Please fill in all fields');
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
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-500/10 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Registration Card */}
      <div className="w-full max-w-md p-8 border rounded-2xl glass-effect border-white/10 shadow-premium z-10 mx-4 transition-all duration-300">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link to="/" className="flex items-center gap-2.5 mb-4 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-md transform group-hover:rotate-6 transition-transform">
              <span className="font-extrabold text-lg text-white">T</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">TaskFlow</span>
          </Link>
          <h2 className="text-2xl font-bold text-white mb-1.5">Get Started</h2>
          <p className="text-xs text-slate-400">Join TaskFlow and collaborate with your team</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name input */}
          <div className="space-y-1">
            <label htmlFor="name" className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 hover:border-white/20 focus:border-brand-500/80 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500/50 text-slate-200 text-sm placeholder-slate-500 transition-all duration-200"
              required
            />
          </div>

          {/* Email input */}
          <div className="space-y-1">
            <label htmlFor="email" className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 hover:border-white/20 focus:border-brand-500/80 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500/50 text-slate-200 text-sm placeholder-slate-500 transition-all duration-200"
              required
            />
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label htmlFor="password" className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 hover:border-white/20 focus:border-brand-500/80 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500/50 text-slate-200 text-sm placeholder-slate-500 transition-all duration-200"
              required
            />
          </div>

          {/* Confirm Password input */}
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 hover:border-white/20 focus:border-brand-500/80 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500/50 text-slate-200 text-sm placeholder-slate-500 transition-all duration-200"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 mt-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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
        <div className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 hover:underline transition-all">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
