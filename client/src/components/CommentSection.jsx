import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getSocket } from '../services/socket';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

function CommentSection({ taskId }) {
  const { user } = useSelector((state) => state.auth);
  const { currentBoard } = useSelector((state) => state.board);
  const members = currentBoard?.members || [];

  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Autocomplete mentions state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionIndex, setMentionIndex] = useState(-1);

  const commentsEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Fetch comments on mount & taskId changes
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/tasks/${taskId}/comments`);
        setComments(response.data);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Failed to fetch comments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [taskId]);

  // Connect socket listener for live real-time comment synchronization
  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      const handleCommentAdded = ({ taskId: incomingTaskId, comment }) => {
        if (incomingTaskId === taskId) {
          setComments((prev) => {
            // Avoid duplicate appends if we were the sender
            if (prev.some((c) => c._id === comment._id)) return prev;
            return [...prev, comment];
          });
        }
      };

      socket.on('comment_added', handleCommentAdded);

      return () => {
        socket.off('comment_added', handleCommentAdded);
      };
    }
  }, [taskId]);

  // Scroll to bottom helper when comment count changes
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedText = newCommentText.trim();
    if (!trimmedText) return;

    setIsSubmitting(true);
    try {
      const response = await api.post(`/tasks/${taskId}/comments`, {
        text: trimmedText,
      });

      // Optimistically append comment
      setComments((prev) => {
        if (prev.some((c) => c._id === response.data._id)) return prev;
        return [...prev, response.data];
      });
      setNewCommentText('');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextareaChange = (e) => {
    const val = e.target.value;
    setNewCommentText(val);

    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = val.substring(0, selectionStart);

    // Find last index of '@'
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);

      // Autocomplete triggers only if there are no spaces or newlines after '@'
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setShowMentions(true);
        setMentionFilter(textAfterAt);
        setMentionIndex(lastAtIndex);
        return;
      }
    }

    setShowMentions(false);
  };

  const selectMention = (memberName) => {
    const formattedName = memberName.replace(/\s+/g, '');
    const before = newCommentText.substring(0, mentionIndex);
    const selectionStart = textareaRef.current?.selectionStart || 0;
    const after = newCommentText.substring(selectionStart);

    const nextText = `${before}@${formattedName} `;
    setNewCommentText(nextText + after);
    setShowMentions(false);

    // Reset cursor position to right after the mention
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const nextPos = nextText.length;
        textareaRef.current.setSelectionRange(nextPos, nextPos);
      }
    }, 10);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Highlights @mentions in text using React elements safely
  const formatCommentText = (text) => {
    const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={index}
            className="px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 font-bold border border-brand-500/15 text-[11px] select-all"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Filter members list based on mentionFilter
  const filteredMembers = members.filter((member) => {
    const mUser = member.user || {};
    return (
      mUser.name &&
      mUser.name.toLowerCase().includes(mentionFilter.toLowerCase())
    );
  });

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Comments List Container */}
      <div className="flex-1 max-h-72 overflow-y-auto space-y-3.5 pr-2 scrollbar-thin">
        {isLoading ? (
          <div className="py-6 flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs text-slate-500 select-none">Loading comments...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="p-5 rounded-xl border border-dashed border-white/5 bg-slate-950/20 text-center text-xs text-slate-500 select-none">
            No comments yet. Mention team members using <strong>@name</strong>!
          </div>
        ) : (
          comments.map((comment) => {
            const author = comment.author || {};
            const isSelf = author._id === user?._id;
            const timeString = comment.createdAt
              ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
              : '';

            return (
              <div
                key={comment._id}
                className={`flex gap-3 items-start ${isSelf ? 'flex-row-reverse' : ''}`}
              >
                {/* Author Initials Avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-[9px] select-none shadow-sm flex-shrink-0"
                  style={{ backgroundColor: author.avatarColor || '#6366F1' }}
                  title={author.name}
                >
                  {getInitials(author.name)}
                </div>

                {/* Comment Bubble Content */}
                <div className={`flex flex-col max-w-[80%] ${isSelf ? 'items-end' : 'items-start'}`}>
                  {/* Author Name + Time Metadata */}
                  <div className="flex items-center gap-1.5 px-1 select-none">
                    <span className="text-[10px] font-bold text-slate-400">
                      {author.name}
                    </span>
                    <span className="text-[9px] text-slate-600">
                      {timeString}
                    </span>
                  </div>

                  {/* Bubble text */}
                  <div
                    className={`mt-1 p-3 rounded-2xl text-xs leading-relaxed border ${
                      isSelf
                        ? 'bg-brand-600/10 border-brand-500/20 text-slate-200 rounded-tr-none'
                        : 'bg-slate-950 border-white/5 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {formatCommentText(comment.text)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={commentsEndRef} />
      </div>

      {/* Comment Input Box Form with Autocomplete */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-start mt-2 relative">
        
        {/* Autocomplete Dropdown */}
        {showMentions && filteredMembers.length > 0 && (
          <div className="absolute bottom-full left-0 mb-2 w-60 rounded-xl bg-slate-900 border border-white/10 shadow-premium p-1.5 z-30 max-h-36 overflow-y-auto scrollbar-thin flex flex-col gap-1">
            {filteredMembers.map((member) => {
              const mUser = member.user || {};
              return (
                <button
                  key={mUser._id}
                  type="button"
                  onClick={() => selectMention(mUser.name)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/5 text-slate-300 hover:text-white transition-all flex items-center gap-2"
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-white text-[8px]"
                    style={{ backgroundColor: mUser.avatarColor || '#6366F1' }}
                  >
                    {getInitials(mUser.name)}
                  </div>
                  <div className="truncate flex-1">
                    <span className="font-semibold">{mUser.name}</span>
                    <span className="text-[10px] text-slate-500 ml-1.5 select-none font-medium">
                      @{mUser.email?.split('@')[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <textarea
          rows="2"
          ref={textareaRef}
          value={newCommentText}
          onChange={handleTextareaChange}
          placeholder="Write a comment, use @name to mention..."
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 focus:border-brand-500 focus:outline-none text-slate-200 text-xs placeholder-slate-600 resize-none transition-all duration-200 scrollbar-thin"
        />
        <button
          type="submit"
          disabled={isSubmitting || !newCommentText.trim()}
          className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 active:scale-95 shadow-md shadow-brand-500/15"
          title="Send comment"
        >
          <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default CommentSection;
