import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { addTask } from '../store/taskSlice';
import { fetchBoardById } from '../store/boardSlice';
import { getUserRole, canEditTasks } from '../utils/permissions';
import TaskCard from './TaskCard';
import toast from 'react-hot-toast';

function Column({ column, tasks }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Set up droppable container for columns to handle drops in empty areas
  const { setNodeRef } = useDroppable({
    id: column._id,
  });

  const boardSlice = useSelector((state) => state.board);
  const currentBoard = boardSlice.currentBoard || {};
  
  const userRole = getUserRole(currentBoard, user?._id);
  const canManageTasks = canEditTasks(userRole);

  const [isAdding, setIsAdding] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenAddForm = () => {
    if (!canManageTasks) {
      return toast.error('Access forbidden: Only Managers or Admins can create tasks');
    }
    setIsAdding(true);
    setTaskTitle('');
  };

  const handleCloseAddForm = () => {
    setIsAdding(false);
  };

  const handleAddTaskSubmit = async (e) => {
    e.preventDefault();

    if (!taskTitle.trim()) {
      return toast.error('Task title is required');
    }

    setIsLoading(true);
    const result = await dispatch(
      addTask({
        board: column.board,
        column: column._id,
        title: taskTitle.trim(),
      })
    );

    if (addTask.fulfilled.match(result)) {
      toast.success('Task created successfully!');
      dispatch(fetchBoardById(column.board));
      handleCloseAddForm();
    } else {
      toast.error(result.payload || 'Failed to create task');
    }
    setIsLoading(false);
  };

  const taskIds = tasks.map((t) => t._id);

  return (
    <div
      ref={setNodeRef}
      className="w-[280px] sm:w-[300px] flex-shrink-0 flex flex-col max-h-[calc(100vh-170px)] rounded-2xl bg-white/[0.01] border border-white/5 p-4 select-none"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-100 text-sm tracking-wide">
          {column.title}
        </h3>
        <span className="w-5 h-5 rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center font-bold text-[10px] text-slate-400">
          {tasks.length}
        </span>
      </div>

      {/* Task Cards List wrapped with SortableContext */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto mb-4 pr-1 scrollbar-thin">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
          {tasks.length === 0 && !isAdding && (
            column.tasks && column.tasks.length > 0 ? (
              <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-white/5 bg-slate-950/20 text-slate-500 text-center select-none min-h-[100px]">
                <span className="text-lg">🔍</span>
                <span className="text-[10px] mt-1 font-medium">No matching tasks</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-white/5 bg-slate-950/20 text-slate-600 text-center select-none min-h-[100px]">
                <span className="text-lg">📭</span>
                <span className="text-[10px] mt-1 font-medium">Empty Column</span>
              </div>
            )
          )}
        </div>
      </SortableContext>

      {/* Bottom Action: Form or "+ Add Task" button */}
      <div className="mt-auto">
        {isAdding ? (
          <form onSubmit={handleAddTaskSubmit} className="space-y-2.5">
            <textarea
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Enter a title for this card..."
              className="w-full p-3 h-20 rounded-xl bg-slate-900 border border-white/10 focus:border-brand-500 focus:outline-none text-slate-200 text-xs placeholder-slate-600 resize-none transition-all duration-200"
              required
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddTaskSubmit(e);
                }
              }}
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/10"
              >
                {isLoading ? (
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  'Add Card'
                )}
              </button>
              <button
                type="button"
                onClick={handleCloseAddForm}
                className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </form>
        ) : (
          canManageTasks && (
            <button
              onClick={handleOpenAddForm}
              className="w-full py-2.5 rounded-xl border border-dashed border-white/5 hover:border-white/10 hover:bg-white/[0.02] text-slate-400 hover:text-white transition-all text-xs font-semibold flex items-center justify-center gap-2 group active:scale-[0.99]"
            >
              <span className="text-slate-500 group-hover:text-slate-300 font-bold transition-colors">+</span>
              Add Task
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default Column;
