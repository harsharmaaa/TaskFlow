import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBoardById } from '../store/boardSlice';
import boardService from '../services/boardService';
import Navbar from '../components/Navbar';
import RoleBadge from '../components/RoleBadge';
import { getUserRole, canManageBoard } from '../utils/permissions';
import toast from 'react-hot-toast';

function TeamMembers() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  const { currentBoard, isLoading, error } = useSelector((state) => state.board);

  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [busyMemberId, setBusyMemberId] = useState(null); // Tracks active operations per row

  useEffect(() => {
    dispatch(fetchBoardById(id));
  }, [id, dispatch]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Determine active user credentials & roles
  const activeUserRole = getUserRole(currentBoard, user?._id);
  const isAdmin = canManageBoard(activeUserRole);

  const handleInvite = async (e) => {
    e.preventDefault();

    if (!inviteEmail.trim()) {
      return toast.error('Email is required');
    }

    if (!isAdmin) {
      return toast.error('Only Admins can invite team members');
    }

    setIsInviting(true);
    try {
      await boardService.addMember(id, {
        email: inviteEmail.trim().toLowerCase(),
        role: 'Member', // Adds as Member by default
      });
      
      toast.success('Member invited successfully!');
      setInviteEmail('');
      // Refresh board details to populate new members
      dispatch(fetchBoardById(id));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to invite user');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (memberUserId, newRole) => {
    if (!isAdmin) {
      return toast.error('Only Admins can modify member roles');
    }

    setBusyMemberId(memberUserId);
    try {
      await boardService.updateMemberRole(id, memberUserId, { role: newRole });
      toast.success('Role updated successfully!');
      dispatch(fetchBoardById(id));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update role');
    } finally {
      setBusyMemberId(null);
    }
  };

  const handleRemoveMember = async (memberUserId, memberUserName) => {
    if (!isAdmin) {
      return toast.error('Only Admins can remove member access');
    }

    if (window.confirm(`Are you sure you want to remove ${memberUserName} from this board?`)) {
      setBusyMemberId(memberUserId);
      try {
        await boardService.removeMember(id, memberUserId);
        toast.success(`${memberUserName} removed from board`);
        dispatch(fetchBoardById(id));
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Failed to remove member');
      } finally {
        setBusyMemberId(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-appBg text-textPrimary flex flex-col font-sans antialiased relative overflow-hidden">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Container */}
      <main className="z-10 flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full flex flex-col">
        
        {/* Board Header Bar */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to={`/boards/${id}`}
            className="p-2 rounded-btn bg-transparent border border-borderSep hover:border-textMuted/30 hover:bg-[#232330]/30 text-textMuted hover:text-textPrimary transition-all active:scale-95 flex-shrink-0"
            title="Back to Board Canvas"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-textPrimary select-none">
              {currentBoard?.title || 'Loading Board'}
            </h1>
            <p className="text-xs text-textMuted mt-1 select-none">
              Team Collaborators and Workspaces Permissions
            </p>
          </div>
        </div>

        {isLoading && !currentBoard ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
            <svg className="animate-spin h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm text-textMuted">Loading team members...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-cardBg border border-borderSep rounded-card p-8 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 text-xl mx-auto mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-textPrimary mb-1">Failed to fetch details</h3>
            <p className="text-xs text-textMuted max-w-xs mb-4">{error}</p>
            <Link to="/dashboard" className="px-4 py-2 rounded-btn border border-borderSep text-xs font-semibold text-textPrimary">
              Back to dashboard
            </Link>
          </div>
        ) : (
          /* Grid Split: Members List (Left) & Invite Form (Right) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Collaborators List (Left Column) */}
            <div className="lg:col-span-2 rounded-card bg-cardBg border border-borderSep p-6 space-y-6 shadow-none">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-textPrimary">Board Collaborators</h2>
                <span className="text-xs bg-appBg text-textMuted px-3 py-1 rounded-full border border-borderSep font-semibold">
                  {currentBoard?.members?.length || 0} Total
                </span>
              </div>

              {/* Members List */}
              <div className="divide-y divide-borderSep">
                {currentBoard?.members?.map((member) => {
                  const mUser = member.user || {};
                  const isOwner = currentBoard.owner?._id === mUser._id;
                  const isSelf = user?._id === mUser._id;
                  const isBusy = busyMemberId === mUser._id;

                  return (
                    <div key={mUser._id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      
                      {/* Member Info & Avatar */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs select-none shadow-sm flex-shrink-0"
                          style={{ backgroundColor: mUser.avatarColor || '#6366F1' }}
                        >
                          {getInitials(mUser.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-textPrimary flex items-center gap-2">
                            <span className="truncate">{mUser.name}</span>
                            {isSelf && (
                              <span className="text-[9px] bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-textMuted truncate mt-0.5">{mUser.email}</div>
                        </div>
                      </div>

                      {/* Member Actions & Badges */}
                      <div className="flex items-center gap-3">
                        {/* Dropdown selectors for Admins to modify roles */}
                        {isAdmin && !isOwner && !isSelf ? (
                          <select
                            value={member.role}
                            disabled={isBusy}
                            onChange={(e) => handleRoleChange(mUser._id, e.target.value)}
                            className="bg-appBg border border-borderSep hover:border-textMuted/30 rounded-input px-2.5 py-1.5 text-xs text-textPrimary focus:outline-none transition-all disabled:opacity-50"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Member">Member</option>
                          </select>
                        ) : (
                          <RoleBadge role={isOwner ? 'Admin' : member.role} />
                        )}

                        {/* Revoke button for Admins */}
                        {isAdmin && !isOwner && !isSelf && (
                          <button
                            onClick={() => handleRemoveMember(mUser._id, mUser.name)}
                            disabled={isBusy}
                            className="p-2 rounded-btn border border-rose-500/10 hover:border-rose-500/30 hover:bg-rose-500/10 text-rose-400 disabled:opacity-50 transition-all"
                            title={`Remove ${mUser.name} from board`}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Invite Team Member Form (Right Column, only visible to Admin) */}
            {isAdmin && (
              <div className="rounded-card bg-cardBg border border-borderSep p-6 space-y-5 shadow-none">
                <h2 className="text-lg font-semibold text-textPrimary">Invite Collaborator</h2>
                <p className="text-xs text-textMuted leading-relaxed">
                  Enter their email address to share access. The user will be added to the board workspace as a <strong>Member</strong> by default.
                </p>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="inviteEmail" className="text-[10px] font-semibold text-textMuted uppercase tracking-wider block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="inviteEmail"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="e.g. colleague@company.com"
                      className="w-full px-4 py-2.5 rounded-input bg-appBg border border-borderSep focus:border-accent focus:outline-none text-textPrimary text-xs placeholder-textMuted/40 transition-all duration-200"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="w-full py-2.5 rounded-btn font-semibold bg-accent hover:bg-accent/90 text-white text-xs disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isInviting ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Inviting...</span>
                      </>
                    ) : (
                      'Invite Member'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default TeamMembers;
