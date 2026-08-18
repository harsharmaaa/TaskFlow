import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import NotificationBell from './NotificationBell';

function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const isDashboardActive = location.pathname === '/dashboard';

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-borderSep bg-cardBg/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-btn bg-accent shadow-sm transform group-hover:rotate-6 transition-transform">
                <span className="font-extrabold text-white text-base">T</span>
              </div>
              <span className="font-bold tracking-tight text-textPrimary transition-colors group-hover:text-accent">
                TaskFlow
              </span>
            </Link>

            <Link
              to="/dashboard"
              className={`px-1 py-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all mt-1 ${
                isDashboardActive
                  ? 'border-accent text-textPrimary'
                  : 'border-transparent text-textMuted hover:text-textPrimary'
              }`}
            >
              Dashboard
            </Link>
          </div>

          {/* User Section & Actions */}
          <div className="flex items-center gap-4">
            <NotificationBell />

            {/* User Profile */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-inner select-none transition-transform hover:scale-105 duration-200"
                style={{ backgroundColor: user?.avatarColor || '#6366F1' }}
              >
                {getInitials(user?.name)}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-textPrimary leading-tight">{user?.name}</div>
                <div className="text-[10px] text-textMuted leading-none mt-0.5">{user?.email}</div>
              </div>
            </div>

            {/* Logout Trigger */}
            <button
              onClick={() => dispatch(logout())}
              className="px-4 py-1.5 rounded-btn border border-borderSep hover:border-rose-500/30 text-xs font-semibold hover:bg-rose-500/10 hover:text-rose-400 active:scale-95 transition-all duration-200"
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
