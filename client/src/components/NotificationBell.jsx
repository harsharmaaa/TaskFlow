import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, markRead, markAllRead } from '../store/notificationSlice';
import { formatDistanceToNow } from 'date-fns';

function NotificationBell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.notification);
  
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications on mount & user change
  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
    }
  }, [user, dispatch]);

  // Click outside to close dropdown listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAllAsRead = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(markAllRead());
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      dispatch(markRead(notification._id));
    }
    setIsOpen(false);

    const boardId = notification.task?.board || notification.task;
    if (boardId) {
      navigate(`/boards/${boardId}`);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'mentioned':
        return (
          <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-[10px] flex-shrink-0">
            💬
          </div>
        );
      case 'assigned':
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-[#34D399]/10 border border-[#34D399]/20 flex items-center justify-center text-[10px] flex-shrink-0">
            👤
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button Icon */}
      <button
        onClick={handleToggle}
        type="button"
        className="relative p-2 rounded-btn bg-transparent border border-borderSep hover:border-textMuted/30 hover:bg-[#232330]/30 text-textMuted hover:text-textPrimary transition-all duration-200 active:scale-95 flex items-center justify-center"
        aria-label="Toggle notifications dropdown"
      >
        <svg
          className={`w-5 h-5 ${unreadCount > 0 ? 'animate-wiggle text-accent' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Count Badge indicator */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[8px] font-black leading-none animate-pulse">
            {unreadCount > 99 ? '99' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel Grid */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-card bg-cardBg border border-borderSep shadow-hover-subtle p-1.5 z-50 flex flex-col overflow-hidden animate-scale-up max-h-[420px]">
          
          {/* Header */}
          <div className="px-4 py-3 border-b border-borderSep flex items-center justify-between">
            <span className="text-xs font-bold text-textPrimary uppercase tracking-wider select-none">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                type="button"
                className="text-[10px] font-bold text-accent hover:text-accent/80 transition-all hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List scroll block */}
          <div className="flex-1 overflow-y-auto divide-y divide-borderSep scrollbar-thin max-h-72">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-textMuted select-none italic">
                All caught up! 🎉
              </div>
            ) : (
              notifications.map((notification) => {
                const timeString = notification.createdAt
                  ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                  : '';

                return (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 flex gap-3 items-start cursor-pointer hover:bg-appBg transition-all border-l-2 ${
                      notification.isRead
                        ? 'border-transparent opacity-60 text-textMuted'
                        : 'border-accent bg-accent/[0.02] text-textPrimary'
                    }`}
                  >
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs leading-snug break-words">
                        {notification.message}
                      </p>
                      <span className="text-[9px] text-textMuted/60 block select-none">
                        {timeString}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}
    </div>
  );
}

export default NotificationBell;
