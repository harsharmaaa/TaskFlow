import React from 'react';
import { useNavigate } from 'react-router-dom';

function BoardCard({ board }) {
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const handleClick = () => {
    navigate(`/boards/${board._id}`);
  };

  const maxAvatars = 4;
  const membersList = board.members || [];
  const displayMembers = membersList.slice(0, maxAvatars);
  const excessCount = membersList.length - maxAvatars;

  return (
    <div
      onClick={handleClick}
      className="p-6 rounded-card bg-cardBg border border-borderSep hover:border-accent hover:bg-cardBg/90 transition-all duration-150 cursor-pointer hover:shadow-hover-subtle flex flex-col justify-between min-h-[160px] group"
    >
      {/* Title */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-textPrimary group-hover:text-accent transition-colors truncate pr-4 tracking-tight">
            {board.title}
          </h3>
          <span className="text-[10px] bg-appBg border border-borderSep text-textMuted font-semibold px-2 py-0.5 rounded-full select-none capitalize">
            {board.owner?.name === board.members?.[0]?.user?.name ? 'Personal' : 'Team'}
          </span>
        </div>
        <p className="text-xs text-textMuted line-clamp-1 mb-4 select-none">
          Created by {board.owner?.name || 'Unknown'}
        </p>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-4 border-t border-borderSep">
        <span className="text-xs font-semibold text-textMuted select-none">
          {membersList.length} {membersList.length === 1 ? 'member' : 'members'}
        </span>

        {/* Overlapping Avatar Stack */}
        <div className="flex -space-x-2 overflow-hidden select-none">
          {displayMembers.map((member, idx) => {
            const userObj = member.user || {};
            return (
              <div
                key={userObj._id || idx}
                className="w-7 h-7 rounded-full border-2 border-cardBg flex items-center justify-center font-bold text-white text-[9px] shadow-sm transform hover:-translate-y-1 transition-transform cursor-help"
                style={{ backgroundColor: userObj.avatarColor || '#6366F1' }}
                title={userObj.name || 'Collaborator'}
              >
                {getInitials(userObj.name)}
              </div>
            );
          })}
          {excessCount > 0 && (
            <div
              className="w-7 h-7 rounded-full border-2 border-cardBg bg-appBg flex items-center justify-center font-bold text-textMuted text-[9px]"
              title={`${excessCount} more members`}
            >
              +{excessCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BoardCard;
