import React from 'react';

function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 w-full min-h-[300px] select-none">
      <div className="flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-accent/10 border-t-accent border-r-accent/40 animate-spin" />
      </div>
      <p className="text-xs font-semibold text-textMuted animate-pulse tracking-wide select-none">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
