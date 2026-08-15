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

  // Limit avatar stack to first 4 members
  const maxAvatars = 4;
  const membersList = board.members || [];
  const displayMembers = membersList.slice(0, maxAvatars);
  const excessCount = membersList.length - maxAvatars;

  return (
    <div
      onClick={handleClick}
      className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-brand-500/30 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer shadow-glass hover:shadow-glass-hover hover:-translate-y-0.5 group flex flex-col justify-between min-h-[160px]"
    >
      {/* Title */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors truncate pr-4">
            {board.title}
          </h3>
          <span className="text-[10px] bg-slate-900 border border-white/5 text-slate-400 font-semibold px-2 py-0.5 rounded-full select-none capitalize">
            {board.owner?.name === board.members?.[0]?.user?.name ? 'Personal' : 'Team'}
          </span>
        </div>
        <p className="text-xs text-slate-400 line-clamp-1 mb-4 select-none">
          Created by {board.owner?.name || 'Unknown'}
        </p>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <span className="text-xs font-medium text-slate-400 select-none">
          {membersList.length} {membersList.length === 1 ? 'member' : 'members'}
        </span>

        {/* Overlapping Avatar Stack */}
        <div className="flex -space-x-2 overflow-hidden select-none">
          {displayMembers.map((member, idx) => {
            const userObj = member.user || {};
            return (
              <div
                key={userObj._id || idx}
                className="w-7 h-7 rounded-full border-2 border-slate-950 flex items-center justify-center font-bold text-white text-[9px] shadow-sm transform hover:-translate-y-1 transition-transform cursor-help"
                style={{ backgroundColor: userObj.avatarColor || '#6366F1' }}
                title={userObj.name || 'Collaborator'}
              >
                {getInitials(userObj.name)}
              </div>
            );
          })}
          {excessCount > 0 && (
            <div
              className="w-7 h-7 rounded-full border-2 border-slate-950 bg-slate-900 flex items-center justify-center font-bold text-slate-300 text-[9px]"
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
