import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
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
    transform: transform
      ? CSS.Transform.toString({
          ...transform,
          scaleX: isDragging ? 1.02 : 1,
          scaleY: isDragging ? 1.02 : 1,
        })
      : undefined,
    transition: transition || 'transform 150ms cubic-bezier(0.2, 0, 0, 1)',
    opacity: isDragging ? 0.6 : 1,
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

  const getPriorityBorderClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'border-l-priorityHigh';
      case 'Medium':
        return 'border-l-priorityMedium';
      case 'Low':
      default:
        return 'border-l-priorityLow';
    }
  };

  const handleCardClick = (e) => {
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
        className={`p-4 rounded-card bg-cardBg border border-borderSep border-l-[3px] ${getPriorityBorderClass(
          task.priority
        )} transition-all select-none group space-y-3.5 touch-none ${
          isDragging ? 'shadow-drag-active scale-[1.02] z-50' : 'hover:border-textMuted/30 hover:shadow-hover-subtle'
        }`}
      >
        {/* Label Chips */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.labels.map((label, idx) => (
              <span
                key={idx}
                className="text-[9px] px-2 py-0.5 rounded-full font-semibold bg-accent/10 text-accent border border-accent/10 uppercase tracking-wide"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Task Title */}
        <h4 className="text-sm font-semibold text-textPrimary leading-relaxed line-clamp-2 transition-colors">
          {task.title}
        </h4>

        {/* Card Footer Info */}
        <div className="flex items-center justify-between pt-2.5 border-t border-borderSep text-xs text-textMuted">
          <div className="flex items-center gap-3">
            {/* Priority Text Indicator */}
            <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">
              {task.priority}
            </span>

            {/* Due Date */}
            {task.dueDate && (
              <div className="flex items-center gap-1 text-[10px] text-textMuted/80 hover:text-textPrimary">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
              </div>
            )}
          </div>

          {/* Assignee Avatar */}
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
                className="w-6 h-6 rounded-full border border-dashed border-borderSep bg-appBg flex items-center justify-center text-textMuted/40 text-[10px]"
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
