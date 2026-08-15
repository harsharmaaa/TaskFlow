import React from 'react';

function RoleBadge({ role }) {
  const getBadgeStyles = (roleName) => {
    switch (roleName) {
      case 'Admin':
        return {
          bg: 'bg-purple-500/10',
          text: 'text-purple-400',
          border: 'border-purple-500/20',
        };
      case 'Manager':
        return {
          bg: 'bg-blue-500/10',
          text: 'text-blue-400',
          border: 'border-blue-500/20',
        };
      case 'Member':
      default:
        return {
          bg: 'bg-slate-500/10',
          text: 'text-slate-400',
          border: 'border-white/5',
        };
    }
  };

  const styles = getBadgeStyles(role);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider select-none ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {role}
    </span>
  );
}

export default RoleBadge;
