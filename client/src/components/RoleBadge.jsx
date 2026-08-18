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
          bg: 'bg-accent/10',
          text: 'text-accent',
          border: 'border-accent/20',
        };
      case 'Member':
      default:
        return {
          bg: 'bg-textMuted/10',
          text: 'text-textMuted',
          border: 'border-borderSep',
        };
    }
  };

  const styles = getBadgeStyles(role);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider select-none ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {role}
    </span>
  );
}

export default RoleBadge;
