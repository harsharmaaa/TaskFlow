import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Landing() {
  const { user } = useSelector((state) => state.auth);

  // If user is already authenticated, redirect them to the dashboard directly
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-600/20 rounded-full filter blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/15 rounded-full filter blur-[150px] pointer-events-none" />

      {/* Spacing element for center alignment */}
      <div />

      {/* Main Content */}
      <main className="z-10 max-w-4xl px-6 text-center py-20 flex-1 flex flex-col justify-center items-center">
        {/* Logo Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
          Collaborate Instantly
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-6 leading-[1.15]">
          Work together.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-indigo-400 to-violet-500">
            In real time.
          </span>
        </h1>

        {/* Hero Description */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          TaskFlow is a collaborative task board where every change syncs instantly across your whole team.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full sm:w-auto">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold bg-slate-900 hover:bg-slate-850 text-slate-200 border border-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Login
          </Link>
        </div>

        {/* Features Preview grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
          {/* Real-Time Sync */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 font-bold mb-4">⚡</div>
            <h3 className="text-slate-200 font-semibold mb-2">Real-Time Sync</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Powered by Socket.io. Task movements and details sync instantly for all team members.
            </p>
          </div>
          {/* Role-Based Access */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold mb-4">🔐</div>
            <h3 className="text-slate-200 font-semibold mb-2">Role-Based Access</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fine-grained access control (Admin, Manager, Member) keeps your workspace secure.
            </p>
          </div>
          {/* Rich Task Details */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold mb-4">📎</div>
            <h3 className="text-slate-200 font-semibold mb-2">Rich Task Details</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Add due dates, comments with @mentions, priorities, labels, and file attachments.
            </p>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="z-10 w-full py-6 text-center border-t border-white/5 text-[10px] text-slate-600 bg-slate-950/40 backdrop-blur-sm">
        <p>&copy; {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
      </footer>

      {/* Decorative board mesh mockup background element */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[80%] h-[30%] bg-gradient-to-t from-brand-500/10 to-transparent rounded-t-[50px] filter blur-[60px] pointer-events-none" />
    </div>
  );
}

export default Landing;
