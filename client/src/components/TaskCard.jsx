import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import TaskDetailModal from './TaskDetailModal';

function TaskCard({ task }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'High':
        return {
          dot: 'bg-rose-500',
          bg: 'bg-rose-500/10',
          text: 'text-rose-400',
          border: 'border-rose-500/20',
        };
      case 'Medium':
        return {
          dot: 'bg-amber-500',
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          border: 'border-amber-500/20',
        };
      case 'Low':
      default:
        return {
          dot: 'bg-emerald-500',
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          border: 'border-emerald-500/20',
        };
    }
  };

  const priorityStyle = getPriorityStyles(task.priority);

  const handleCardClick = (e) => {
    // Prevent clicking from triggering drag activation or vice versa if event propagation overlaps
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
      className={`p-4 rounded-xl bg-slate-900 border border-white/5 hover:border-white/15 hover:bg-slate-900/80 shadow-glass hover:shadow-premium select-none group space-y-3.5 touch-none`}
    >
      {/* Label Chips */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((label, idx) => (
            <span
              key={idx}
              className="text-[9px] px-2 py-0.5 rounded-md font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/15 uppercase tracking-wide"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Task Title */}
      <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white leading-relaxed line-clamp-2 transition-colors">
        {task.title}
      </h4>

      {/* Card Footer Info */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-xs text-slate-400">
        
        {/* Left indicators: Priority & Due Date */}
        <div className="flex items-center gap-3">
          {/* Priority Badge */}
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
            {task.priority}
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
            </div>
          )}
        </div>

        {/* Right indicator: Assignee Avatar */}
        <div>
          {task.assignee ? (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-[9px] shadow-sm transform hover:scale-105 transition-transform"
              style={{ backgroundColor: task.assignee.avatarColor || '#6366F1' }}
              title={`Assigned to ${task.assignee.name}`}
            >
              {getInitials(task.assignee.name)}
            </div>
          ) : (
            <div
              className="w-6 h-6 rounded-full border border-dashed border-white/10 bg-slate-950 flex items-center justify-center text-slate-600 text-[10px]"
              title="Unassigned"
            >
              👤
            </div>
          )}
        </div>
      </div>
    </div>

    <TaskDetailModal
      task={task}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    />
  </>
);
}

export default TaskCard;
