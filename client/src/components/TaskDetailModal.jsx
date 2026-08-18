import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { editTask, removeTask } from '../store/taskSlice';
import { getUserRole, canEditTasks } from '../utils/permissions';
import AttachmentUpload from './AttachmentUpload';
import CommentSection from './CommentSection';
import ActivityLog from './ActivityLog';
import toast from 'react-hot-toast';

function TaskDetailModal({ task, isOpen, onClose }) {
  const dispatch = useDispatch();
  const isInitialMount = useRef(true);

  const { user } = useSelector((state) => state.auth);
  const { currentBoard } = useSelector((state) => state.board);

  // Local state for auto-save fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState([]);
  const [newLabelInput, setNewLabelInput] = useState('');
  const [saveStatus, setSaveStatus] = useState('Saved'); // 'Saved', 'Saving...', 'Error'

  // Sync state when task changes or modal opens
  useEffect(() => {
    if (task && isOpen) {
      isInitialMount.current = true;
      setTitle(task.title || '');
      setDescription(task.description || '');
      setAssigneeId(task.assignee?._id || '');
      setPriority(task.priority || 'Medium');
      setLabels(task.labels || []);
      setDueDate(task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '');
      setSaveStatus('Saved');
      
      // Delay resetting initial mount flag so first renders don't save
      setTimeout(() => {
        isInitialMount.current = false;
      }, 100);
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  // Determine user permissions
  const userRole = getUserRole(currentBoard, user?._id);
  const canManageTask = canEditTasks(userRole); // Only Manager+ can delete tasks
  const canInteract = canEditTasks(userRole); // Only Manager+ can edit task details
  const membersList = currentBoard?.members || [];

  // Handler to perform backend auto-save operations
  const triggerAutoSave = async (updatedFields) => {
    if (isInitialMount.current) return;
    if (!canInteract) {
      toast.error('You do not have permission to edit tasks');
      return;
    }

    setSaveStatus('Saving...');
    const result = await dispatch(
      editTask({
        id: task._id,
        taskData: updatedFields,
      })
    );

    if (editTask.fulfilled.match(result)) {
      setSaveStatus('Saved');
    } else {
      setSaveStatus('Error');
      toast.error(result.payload || 'Auto-save failed');
    }
  };

  // Field change & blur handlers
  const handleTitleBlur = () => {
    if (!title.trim()) {
      setTitle(task.title); // Revert to previous title if cleared
      return toast.error('Task title cannot be empty');
    }
    if (title.trim() !== task.title) {
      triggerAutoSave({ title: title.trim() });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      triggerAutoSave({ description });
    }
  };

  const handleAssigneeChange = (e) => {
    const nextVal = e.target.value;
    setAssigneeId(nextVal);
    triggerAutoSave({ assignee: nextVal || null });
  };

  const handlePrioritySelect = (selectedPriority) => {
    if (selectedPriority !== priority) {
      setPriority(selectedPriority);
      triggerAutoSave({ priority: selectedPriority });
    }
  };

  const handleDueDateChange = (e) => {
    const nextVal = e.target.value;
    setDueDate(nextVal);
    triggerAutoSave({ dueDate: nextVal || null });
  };

  // Custom label addition
  const handleAddLabel = (e) => {
    e.preventDefault();
    const cleanLabel = newLabelInput.trim();
    if (!cleanLabel) return;
    
    if (labels.includes(cleanLabel)) {
      setNewLabelInput('');
      return toast.error('Label already exists');
    }

    const nextLabels = [...labels, cleanLabel];
    setLabels(nextLabels);
    setNewLabelInput('');
    triggerAutoSave({ labels: nextLabels });
  };

  // Custom label deletion
  const handleRemoveLabel = (labelToRemove) => {
    const nextLabels = labels.filter((l) => l !== labelToRemove);
    setLabels(nextLabels);
    triggerAutoSave({ labels: nextLabels });
  };

  // Task deletion
  const handleDeleteTask = async () => {
    if (!canManageTask) {
      return toast.error('Access forbidden: Only Managers or Admins can delete tasks');
    }

    if (window.confirm('Are you sure you want to permanently delete this task?')) {
      const result = await dispatch(removeTask(task._id));
      if (removeTask.fulfilled.match(result)) {
        toast.success('Task deleted successfully');
        onClose();
      } else {
        toast.error(result.payload || 'Failed to delete task');
      }
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-appBg/85 backdrop-blur-md animate-fade-in"
    >
      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl h-full sm:h-[85vh] bg-cardBg sm:border border-borderSep sm:rounded-card flex flex-col overflow-hidden animate-scale-up"
      >
        {/* Header Block */}
        <div className="p-6 border-b border-borderSep flex items-start justify-between gap-4">
          <div className="flex-1 flex flex-col gap-1.5">
            {/* Auto-save Status Indicator */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider select-none">
              {saveStatus === 'Saving...' ? (
                <span className="text-amber-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Saving Changes...
                </span>
              ) : saveStatus === 'Error' ? (
                <span className="text-rose-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  Save Error
                </span>
              ) : (
                <span className="text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Changes Saved
                </span>
              )}
            </div>

            {/* Editable Title Input */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              disabled={!canInteract}
              placeholder="Enter task title..."
              className="text-lg sm:text-xl font-semibold text-textPrimary bg-transparent border-b border-transparent hover:border-borderSep focus:border-accent focus:outline-none w-full py-0.5 transition-all select-all disabled:cursor-not-allowed tracking-tight"
            />
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-btn text-textMuted hover:text-textPrimary hover:bg-[#232330]/50 transition-all flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 scrollbar-thin">
          
          {/* Left / Middle: Task fields and placeholders */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Description Textarea */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-xs font-semibold text-textMuted uppercase tracking-wider block">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                disabled={!canInteract}
                placeholder="Add a more detailed description for this task..."
                className="w-full h-32 px-4 py-3 rounded-input bg-appBg border border-borderSep focus:border-accent focus:outline-none text-textPrimary text-sm placeholder-textMuted/40 resize-none transition-all disabled:cursor-not-allowed"
              />
            </div>

            <hr className="border-borderSep" />

            {/* Attachments Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider flex items-center gap-1.5 select-none">
                📎 File Attachments
              </h3>
              <AttachmentUpload taskId={task._id} attachments={task.attachments || []} />
            </div>

            {/* Comments Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider flex items-center gap-1.5 select-none">
                💬 Comments & Mentions
              </h3>
              <CommentSection taskId={task._id} />
            </div>

            {/* Audit Logs Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider flex items-center gap-1.5 select-none">
                📜 Activity Audit Log
              </h3>
              <ActivityLog taskId={task._id} />
            </div>

          </div>

          {/* Right Column: Sidebar metadata controls */}
          <div className="space-y-5 bg-appBg/50 p-4 rounded-card border border-borderSep h-fit">
            
            {/* Assignee Config */}
            <div className="space-y-2">
              <label htmlFor="assignee" className="text-[10px] font-semibold text-textMuted uppercase tracking-wider block">
                Assignee
              </label>
              <select
                id="assignee"
                value={assigneeId}
                onChange={handleAssigneeChange}
                disabled={!canInteract}
                className="w-full px-3.5 py-2.5 rounded-input bg-cardBg border border-borderSep text-textPrimary text-xs focus:border-accent focus:outline-none transition-all disabled:cursor-not-allowed"
              >
                <option value="">Unassigned</option>
                {membersList.map((member) => {
                  const mUser = member.user || {};
                  return (
                    <option key={mUser._id} value={mUser._id}>
                      {mUser.name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Priority Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-textMuted uppercase tracking-wider block">
                Priority
              </label>
              <div className="flex gap-2">
                {['Low', 'Medium', 'High'].map((p) => {
                  const isActive = priority === p;
                  let colorClass = '';
                  if (isActive) {
                    if (p === 'High') colorClass = 'bg-priorityHigh text-appBg font-bold';
                    else if (p === 'Medium') colorClass = 'bg-priorityMedium text-appBg font-bold';
                    else colorClass = 'bg-priorityLow text-appBg font-bold';
                  } else {
                    colorClass = 'bg-cardBg border border-borderSep text-textMuted hover:text-textPrimary hover:border-textMuted/30';
                  }
                  
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePrioritySelect(p)}
                      disabled={!canInteract}
                      className={`flex-1 py-2 px-1 rounded-btn text-[10px] font-bold transition-all ${colorClass} disabled:cursor-not-allowed`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date Config */}
            <div className="space-y-2">
              <label htmlFor="dueDate" className="text-[10px] font-semibold text-textMuted uppercase tracking-wider block">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={handleDueDateChange}
                disabled={!canInteract}
                className="w-full px-3.5 py-2 rounded-input bg-cardBg border border-borderSep text-textPrimary text-xs focus:border-accent focus:outline-none transition-all disabled:cursor-not-allowed [color-scheme:dark]"
              />
            </div>

            {/* Labels Manager */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-semibold text-textMuted uppercase tracking-wider block">
                Labels
              </label>
              
              {/* Existing label pills */}
              <div className="flex flex-wrap gap-1.5">
                {labels.map((label, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/15 uppercase tracking-wide"
                  >
                    {label}
                    {canInteract && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLabel(label)}
                        className="text-textMuted hover:text-textPrimary font-bold"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
                {labels.length === 0 && (
                  <span className="text-[10px] text-textMuted/40 select-none italic">No labels</span>
                )}
              </div>

              {/* Add label form */}
              {canInteract && (
                <form onSubmit={handleAddLabel} className="flex gap-2">
                  <input
                    type="text"
                    value={newLabelInput}
                    onChange={(e) => setNewLabelInput(e.target.value)}
                    placeholder="New label..."
                    className="flex-1 px-3 py-1.5 rounded-input bg-cardBg border border-borderSep text-textPrimary text-[10px] focus:border-accent focus:outline-none transition-all"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-btn bg-accent hover:bg-accent/90 text-white font-semibold text-[10px] transition-all active:scale-95"
                  >
                    +
                  </button>
                </form>
              )}
            </div>

            {/* Danger Zone: Delete task (Manager+) */}
            {canManageTask && (
              <div className="pt-4 border-t border-borderSep mt-4">
                <button
                  type="button"
                  onClick={handleDeleteTask}
                  className="w-full py-2.5 rounded-btn border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 hover:border-rose-500/30 text-rose-400 text-xs font-semibold active:scale-[0.98] transition-all duration-200"
                >
                  Delete Task
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

export default TaskDetailModal;
