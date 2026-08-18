import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Landing() {
  const { user } = useSelector((state) => state.auth);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-appBg text-textPrimary font-sans antialiased">
      <div />

      <main className="z-10 max-w-4xl px-6 text-center py-20 flex-1 flex flex-col justify-center items-center">
        {/* Label Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider">
          Collaborate Instantly
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-textPrimary tracking-[-0.02em] mb-6 leading-[1.12]">
          Work together.{' '}
          <span className="text-accent">
            In real time.
          </span>
        </h1>

        {/* Hero Description */}
        <p className="text-base sm:text-lg text-textMuted max-w-xl mx-auto mb-10 leading-relaxed">
          TaskFlow is a collaborative task board where every change syncs instantly across your whole team.
        </p>

        {/* Call to Actions */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <Link
            to="/register"
            className="px-8 py-3 rounded-btn font-semibold bg-accent hover:bg-accent/90 text-white transition-all duration-200"
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 rounded-btn font-semibold border border-borderSep bg-cardBg hover:border-textMuted/30 text-textPrimary transition-all duration-200"
          >
            Login
          </Link>
        </div>

        {/* Features Preview grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
          <div className="p-6 rounded-card bg-cardBg border border-borderSep">
            <div className="text-accent text-lg font-bold mb-3">⚡</div>
            <h3 className="text-textPrimary font-semibold mb-2 text-sm tracking-[-0.02em]">Real-Time Sync</h3>
            <p className="text-xs text-textMuted leading-relaxed">
              Powered by Socket.io. Task movements and details sync instantly for all team members.
            </p>
          </div>
          <div className="p-6 rounded-card bg-cardBg border border-borderSep">
            <div className="text-accent text-lg font-bold mb-3">🔐</div>
            <h3 className="text-textPrimary font-semibold mb-2 text-sm tracking-[-0.02em]">Role-Based Access</h3>
            <p className="text-xs text-textMuted leading-relaxed">
              Fine-grained access control (Admin, Manager, Member) keeps your workspace secure.
            </p>
          </div>
          <div className="p-6 rounded-card bg-cardBg border border-borderSep">
            <div className="text-accent text-lg font-bold mb-3">📎</div>
            <h3 className="text-textPrimary font-semibold mb-2 text-sm tracking-[-0.02em]">Rich Task Details</h3>
            <p className="text-xs text-textMuted leading-relaxed">
              Add due dates, comments with @mentions, priorities, labels, and file attachments.
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full py-6 text-center border-t border-borderSep text-[10px] text-textMuted bg-cardBg/30">
        <p>&copy; {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Landing;
