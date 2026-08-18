import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBoards, addBoard, clearBoardError } from '../store/boardSlice';
import Navbar from '../components/Navbar';
import BoardCard from '../components/BoardCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

function Dashboard() {
  const dispatch = useDispatch();
  const { boards, isLoading, error } = useSelector((state) => state.board);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearBoardError());
    }
  }, [error, dispatch]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setBoardTitle('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();

    if (!boardTitle.trim()) {
      return toast.error('Board title is required');
    }

    setIsSubmitting(true);
    const result = await dispatch(addBoard({ title: boardTitle.trim() }));
    setIsSubmitting(false);

    if (addBoard.fulfilled.match(result)) {
      toast.success('Board created successfully!');
      handleCloseModal();
    }
  };

  return (
    <div className="min-h-screen bg-appBg text-textPrimary flex flex-col font-sans antialiased relative overflow-hidden">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Container */}
      <main className="z-10 flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
        
        {/* Dashboard Title & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-textPrimary mb-2">
              Workspaces
            </h1>
            <p className="text-xs sm:text-sm text-textMuted">
              Manage your personal and collaborative task boards.
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            className="w-full sm:w-auto px-4 py-2 rounded-btn font-semibold bg-accent hover:bg-accent/90 text-white text-xs transition-all duration-200 active:scale-95"
          >
            Create New Board
          </button>
        </div>

        {/* Boards List Grid */}
        {isLoading && boards.length === 0 ? (
          <LoadingSpinner message="Fetching workspaces..." />
        ) : boards.length === 0 ? (
          /* Empty Workspace State */
          <div className="flex flex-col items-center justify-center p-12 rounded-card border border-dashed border-borderSep bg-cardBg text-center min-h-[300px] transition-all">
            <div className="text-2xl mb-5 select-none">
              📁
            </div>
            <h3 className="text-lg font-semibold text-textPrimary mb-2">No boards created yet</h3>
            <p className="text-sm text-textMuted max-w-sm leading-relaxed mb-6">
              Create a board to start mapping columns, tracking tasks, and collaborating with your team in real time.
            </p>
            <button
              onClick={handleOpenModal}
              className="px-5 py-2.5 rounded-btn font-semibold bg-accent hover:bg-accent/90 text-white active:scale-95 transition-all duration-200 text-xs uppercase tracking-wider"
            >
              Initialize First Workspace
            </button>
          </div>
        ) : (
          /* Workspaces Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Create Board Card Button */}
            <div
              onClick={handleOpenModal}
              className="p-6 rounded-card border border-dashed border-borderSep hover:border-textMuted/30 bg-cardBg transition-all duration-150 cursor-pointer flex flex-col items-center justify-center min-h-[160px] group"
            >
              <div className="w-9 h-9 rounded-btn bg-[#232330]/50 border border-borderSep flex items-center justify-center text-textMuted group-hover:text-accent group-hover:bg-accent/10 transition-all duration-150 text-lg mb-3">
                +
              </div>
              <span className="text-sm font-semibold text-textMuted group-hover:text-accent transition-colors select-none">
                Create New Board
              </span>
            </div>

            {/* Render Workspaces */}
            {boards.map((board) => (
              <BoardCard key={board._id} board={board} />
            ))}
          </div>
        )}
      </main>

      {/* Create Board Overlay Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-appBg/85 backdrop-blur-md animate-fade-in"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-md p-8 rounded-card bg-cardBg border border-borderSep shadow-hover-subtle transform transition-all animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-textPrimary tracking-tight">Create New Board</h2>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-btn text-textMuted hover:text-textPrimary hover:bg-[#232330]/50 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateBoard} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="boardTitle" className="text-xs font-semibold text-textMuted uppercase tracking-wider">
                  Board Title
                </label>
                <input
                  type="text"
                  id="boardTitle"
                  value={boardTitle}
                  onChange={(e) => setBoardTitle(e.target.value)}
                  placeholder="e.g. Marketing Campaign, Development Sprint"
                  className="w-full px-4 py-2.5 rounded-input bg-appBg border border-borderSep focus:border-accent focus:outline-none text-textPrimary text-sm placeholder-textMuted/40 transition-all duration-200"
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-btn border border-borderSep text-xs font-semibold hover:border-textMuted/30 text-textPrimary transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-btn text-xs font-semibold bg-accent hover:bg-accent/90 text-white disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Creating...</span>
                    </>
                  ) : (
                    'Create Board'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
