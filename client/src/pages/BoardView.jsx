import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  fetchBoardById,
  clearCurrentBoard,
  moveTaskOptimistically,
} from '../store/boardSlice';
import { relocateTask } from '../store/taskSlice';
import { getUserRole, canManageBoard } from '../utils/permissions';
import boardService from '../services/boardService';
import useSocket from '../hooks/useSocket';
import Navbar from '../components/Navbar';
import Column from '../components/Column';
import SearchFilterBar from '../components/SearchFilterBar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

function BoardView() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { currentBoard, isLoading, error, presence } = useSelector((state) => state.board);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedLabels, setSelectedLabels] = useState([]);

  // Invoke our custom Socket.io integration hook
  useSocket(id);

  const handleClearFilters = () => {
    setSearchQuery('');
    setAssigneeFilter('all');
    setPriorityFilter('all');
    setSelectedLabels([]);
  };

  const allLabels = Array.from(
    new Set(
      (currentBoard?.columns || [])
        .flatMap((col) => col.tasks || [])
        .flatMap((task) => task.labels || [])
    )
  ).filter(Boolean);

  const getFilteredTasksForColumn = (col) => {
    return (col.tasks || []).filter((task) => {
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (assigneeFilter !== 'all') {
        if (assigneeFilter === 'unassigned') {
          if (task.assignee) return false;
        } else {
          const taskAssigneeId = task.assignee?._id || task.assignee;
          if (!taskAssigneeId || taskAssigneeId.toString() !== assigneeFilter) {
            return false;
          }
        }
      }
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }
      if (selectedLabels.length > 0) {
        const taskLabels = task.labels || [];
        const matchesAll = selectedLabels.every((label) => taskLabels.includes(label));
        if (!matchesAll) return false;
      }
      return true;
    });
  };

  const totalMatches = currentBoard?.columns
    ? currentBoard.columns.reduce((sum, col) => sum + getFilteredTasksForColumn(col).length, 0)
    : 0;

  const hasActiveFilters =
    searchQuery ||
    assigneeFilter !== 'all' ||
    priorityFilter !== 'all' ||
    selectedLabels.length > 0;

  // Set up pointer and touch sensors with activation constraints
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // Require 8px drag to distinguish clicks from drags
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200, // Require 200ms hold for mobile drag start to allow scrolling
      tolerance: 5,
    },
  });

  const sensors = useSensors(pointerSensor, touchSensor);

  useEffect(() => {
    dispatch(fetchBoardById(id));

    return () => {
      dispatch(clearCurrentBoard());
    };
  }, [id, dispatch]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getMemberColor = (activeUser) => {
    const memberObj = currentBoard?.members?.find(
      (m) => m.user && m.user._id === activeUser.userId
    );
    return memberObj?.user?.avatarColor || (currentBoard?.owner?._id === activeUser.userId ? currentBoard.owner.avatarColor : '#6366F1');
  };

  // Determine if user has Admin privileges
  const userRole = getUserRole(currentBoard, user?._id);
  const isAdmin = canManageBoard(userRole);
  const canMoveTasks = userRole === 'Admin' || userRole === 'Manager' || userRole === 'Member';

  const handleDeleteBoard = async () => {
    if (window.confirm('Are you sure you want to permanently delete this board? This action will purge all columns and tasks!')) {
      try {
        await boardService.deleteBoard(id);
        toast.success('Board deleted successfully');
        navigate('/dashboard');
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Failed to delete board');
      }
    }
  };

  // Helper to find column ID of active or over draggable elements
  const findColumnId = (itemId) => {
    if (!currentBoard || !currentBoard.columns) return null;

    // Check if the drop target ID is a Column ID itself
    if (currentBoard.columns.some((c) => c._id === itemId)) {
      return itemId;
    }

    // Otherwise look up which column contains the Task ID
    const foundCol = currentBoard.columns.find((c) =>
      c.tasks.some((t) => t._id === itemId)
    );
    return foundCol ? foundCol._id : null;
  };

  // Callback triggered when drag finishes
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) return;
    if (active.id === over.id) return;

    if (!canMoveTasks) {
      return toast.error('Access forbidden: Only board members can move tasks');
    }

    const taskId = active.id;
    const sourceColId = findColumnId(active.id);
    const destColId = findColumnId(over.id);

    if (!sourceColId || !destColId) return;

    // Retrieve target index inside the destination column
    const destCol = currentBoard.columns.find((c) => c._id === destColId);
    if (!destCol) return;

    let targetIndex;
    if (over.id === destColId) {
      // Dropped onto empty column background, put at end
      targetIndex = destCol.tasks.length;
    } else {
      // Dropped onto another task card, place at its index
      const overIndex = destCol.tasks.findIndex((t) => t._id === over.id);
      targetIndex = overIndex === -1 ? destCol.tasks.length : overIndex;
    }

    // 1. Optimistically update local board Redux state to keep UI instant
    dispatch(
      moveTaskOptimistically({
        taskId,
        sourceColId,
        destColId,
        targetIndex,
      })
    );

    // 2. Call backend in background
    const result = await dispatch(
      relocateTask({
        id: taskId,
        moveData: { column: destColId, order: targetIndex },
      })
    );

    // 3. Revert changes on backend error
    if (relocateTask.rejected.match(result)) {
      toast.error('Failed to move task. Reverting position.');
      dispatch(fetchBoardById(currentBoard._id));
    }
  };

  return (
    <div className="min-h-screen bg-appBg text-textPrimary flex flex-col font-sans antialiased relative overflow-hidden">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Container */}
      <main className="z-10 flex-1 p-6 sm:p-8 w-full flex flex-col overflow-hidden">
        
        {/* Board Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          
          {/* Back button + Board Title */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="p-2 rounded-btn bg-transparent border border-borderSep hover:border-textMuted/30 hover:bg-[#232330]/30 text-textMuted hover:text-textPrimary transition-all active:scale-95 flex-shrink-0"
              title="Back to Workspaces"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            
            {isLoading && !currentBoard ? (
              <div className="h-8 w-48 rounded bg-[#15151C] animate-pulse border border-borderSep" />
            ) : error ? (
              <h1 className="text-2xl font-semibold text-rose-500 tracking-tight">Board Error</h1>
            ) : (
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-textPrimary select-none">
                  {currentBoard?.title}
                </h1>
                {currentBoard && (
                  <p className="text-[10px] text-textMuted mt-1 select-none">
                    Owner: <span className="text-textPrimary font-semibold">{currentBoard.owner?.name}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Member avatars list + Manage team */}
          {currentBoard && !isLoading && (
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              
              {/* Online Presence Stack */}
              {presence && presence.length > 0 && (
                <div className="flex items-center gap-2 bg-[#6366F1]/5 border border-[#6366F1]/15 rounded-full px-3 py-1.5 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[9px] text-[#6366F1] font-bold uppercase tracking-wider mr-1 select-none">Online:</span>
                  <div className="flex -space-x-1.5 select-none">
                    {presence.map((activeUser, idx) => {
                      const isSelf = activeUser.userId === user?._id;
                      return (
                        <div
                          key={activeUser.socketId || idx}
                          className={`w-6 h-6 rounded-full border border-borderSep flex items-center justify-center font-bold text-white text-[8px] transform hover:-translate-y-1 transition-transform cursor-help shadow-sm relative ${
                            isSelf ? 'ring-2 ring-accent/30 animate-pulse' : ''
                          }`}
                          style={{ backgroundColor: getMemberColor(activeUser) }}
                          title={`${activeUser.name} is active ${isSelf ? '(You)' : ''}`}
                        >
                          {getInitials(activeUser.name)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Member Stack */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-textMuted mr-1 select-none font-semibold">Collaborators:</span>
                <div className="flex -space-x-1.5 select-none">
                  {currentBoard.members?.map((member, idx) => {
                    const memberUser = member.user || {};
                    const isSelf = memberUser._id === user?._id;
                    return (
                      <div
                        key={memberUser._id || idx}
                        className={`w-7 h-7 rounded-full border-2 border-borderSep flex items-center justify-center font-bold text-white text-[9px] shadow-sm transform hover:-translate-y-1 transition-transform cursor-help relative ${
                          isSelf ? 'ring-2 ring-accent/30 animate-pulse' : ''
                        }`}
                        style={{ backgroundColor: memberUser.avatarColor || '#6366F1' }}
                        title={`${memberUser.name} (${member.role}) ${isSelf ? '(You)' : ''}`}
                      >
                        {getInitials(memberUser.name)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Manage team configuration buttons */}
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <Link
                    to={`/boards/${id}/team`}
                    className="px-3.5 py-2 rounded-btn bg-cardBg border border-borderSep hover:border-textMuted/30 text-textMuted hover:text-textPrimary text-xs font-semibold active:scale-95 transition-all duration-200"
                  >
                    Manage Team
                  </Link>
                  <button
                    onClick={handleDeleteBoard}
                    className="px-3.5 py-2 rounded-btn border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 hover:border-rose-500/30 text-rose-400 hover:text-rose-500 text-xs font-semibold active:scale-95 transition-all duration-200"
                  >
                    Delete Board
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        {currentBoard && !isLoading && (
          <SearchFilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            assigneeFilter={assigneeFilter}
            setAssigneeFilter={setAssigneeFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            selectedLabels={selectedLabels}
            setSelectedLabels={setSelectedLabels}
            onClear={handleClearFilters}
            members={currentBoard.members || []}
            allLabels={allLabels}
          />
        )}

        {/* Matches Count */}
        {currentBoard && !isLoading && hasActiveFilters && (
          <div className="text-xs text-textMuted mb-4 select-none px-1">
            🎯 <span className="text-accent font-bold">{totalMatches}</span> task{totalMatches === 1 ? '' : 's'} match{totalMatches === 1 ? 'es' : ''} your active filters
          </div>
        )}

        {/* Board Columns Scroll Area */}
        <div className="flex-1 overflow-x-auto pb-4 scrollbar-thin flex items-start gap-6 select-none min-h-[300px]">
          {isLoading && !currentBoard ? (
            <LoadingSpinner message="Loading board canvas..." />
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-card border border-borderSep bg-cardBg text-center py-20 min-h-[400px]">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 text-xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-textPrimary mb-1">Failed to fetch board</h3>
              <p className="text-xs text-textMuted max-w-xs mb-4">{error}</p>
              <Link to="/dashboard" className="px-4 py-2 rounded-btn border border-borderSep text-xs font-semibold hover:border-textMuted/30 text-textPrimary">
                Back to workspaces
              </Link>
            </div>
          ) : currentBoard ? (
            /* Wrap columns grid with DndContext */
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragEnd={handleDragEnd}
            >
              <div className="flex flex-row items-start gap-6 h-full w-full">
                {currentBoard.columns?.map((col) => (
                  <Column
                    key={col._id}
                    column={col}
                    tasks={getFilteredTasksForColumn(col)}
                  />
                ))}
              </div>
            </DndContext>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default BoardView;
