export const getUserRole = (board, userId) => {
  if (!board || !userId) return null;

  // 1. Check if user is the board owner
  const ownerId = board.owner?._id || board.owner;
  if (ownerId?.toString() === userId?.toString()) {
    return 'Admin';
  }

  // 2. Check board members array
  const memberObj = board.members?.find((m) => {
    const memberUserId = m.user?._id || m.user;
    return memberUserId?.toString() === userId?.toString();
  });

  return memberObj ? memberObj.role : null;
};

export const canEditTasks = (role) => {
  return role === 'Admin' || role === 'Manager';
};

export const canManageBoard = (role) => {
  return role === 'Admin';
};

const permissions = {
  getUserRole,
  canEditTasks,
  canManageBoard,
};

export default permissions;
