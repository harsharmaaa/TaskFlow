import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

function ActivityLog({ taskId }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchActivity = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/tasks/${taskId}/activity`);
        setActivities(response.data);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Failed to load activity logs');
      } finally {
        setIsLoading(false);
      }
    };

    if (taskId) {
      fetchActivity();
    }
  }, [taskId]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="py-6 flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs text-slate-500 select-none">Loading audit trail...</span>
        </div>
      ) : activities.length === 0 ? (
        <div className="p-5 rounded-xl border border-dashed border-white/5 bg-slate-950/20 text-center text-xs text-slate-500 select-none">
          No activities logged for this task yet.
        </div>
      ) : (
        /* Vertical Timeline Wrapper */
        <div className="relative border-l border-white/10 ml-3.5 pl-5 space-y-5">
          {activities.map((activity, idx) => {
            const userObj = activity.user || {};
            const timeString = activity.createdAt
              ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
              : '';

            return (
              <div key={activity._id || idx} className="relative group">
                
                {/* Timeline node dot (Avatar) */}
                <div
                  className="absolute -left-[30px] top-0.5 w-6 h-6 rounded-full border border-slate-950 flex items-center justify-center text-[8px] font-extrabold text-white select-none shadow-premium ring-4 ring-slate-900"
                  style={{ backgroundColor: userObj.avatarColor || '#6366F1' }}
                  title={userObj.name}
                >
                  {getInitials(userObj.name)}
                </div>

                {/* Timeline Details Block */}
                <div className="text-xs leading-relaxed">
                  <div className="text-slate-300">
                    <span className="font-bold text-white mr-1.5 hover:underline cursor-help" title={userObj.email}>
                      {userObj.name}
                    </span>
                    <span>{activity.details || activity.action}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1.5 block select-none">
                    {timeString}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ActivityLog;
