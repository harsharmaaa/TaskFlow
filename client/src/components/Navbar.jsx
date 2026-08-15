import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

function Navbar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/5 bg-slate-900/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex items-center justify-center w-8.5 h-8.5 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-md transform group-hover:rotate-6 transition-transform">
                <span className="font-extrabold text-white text-base">T</span>
              </div>
              <span className="font-bold tracking-tight text-white group-hover:text-brand-400 transition-colors">
                TaskFlow
              </span>
            </Link>
          </div>

          {/* User Section & Actions */}
          <div className="flex items-center gap-4">
            {/* User Profile */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-8.5 h-8.5 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-inner select-none transition-transform hover:scale-105 duration-200"
                style={{ backgroundColor: user?.avatarColor || '#6366F1' }}
              >
                {getInitials(user?.name)}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-white leading-tight">{user?.name}</div>
                <div className="text-[10px] text-slate-400 leading-none mt-0.5">{user?.email}</div>
              </div>
            </div>

            {/* Logout Trigger */}
            <button
              onClick={() => dispatch(logout())}
              className="px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-rose-500/30 text-xs font-semibold hover:bg-rose-500/10 hover:text-rose-400 active:scale-95 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
