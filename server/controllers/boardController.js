const asyncHandler = require('express-async-handler');
const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const User = require('../models/User');
const logActivity = require('../utils/logActivity');

// @desc    Create a new board
// @route   POST /api/boards
// @access  Private
const createBoard = asyncHandler(async (req, res) => {
  const { title } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Please provide a board title');
  }

  // 1. Create the Board with owner set as an Admin member
  const board = await Board.create({
    title,
    owner: req.user._id,
    members: [{ user: req.user._id, role: 'Admin' }],
  });

  // 2. Automatically generate the 4 default columns
  const defaultColumns = ['To Do', 'In Progress', 'Review', 'Done'];
  const columnPromises = defaultColumns.map((colTitle, index) =>
    Column.create({
      board: board._id,
      title: colTitle,
      order: index,
    })
  );

  await Promise.all(columnPromises);

  // 3. Return the populated board details
  const fullBoard = await Board.findById(board._id)
    .populate('owner', 'name email avatarColor')
    .populate('members.user', 'name email avatarColor');

  res.status(201).json(fullBoard);
});

// @desc    Get all boards the authenticated user belongs to
// @route   GET /api/boards
// @access  Private
const getBoards = asyncHandler(async (req, res) => {
  const boards = await Board.find({
    'members.user': req.user._id,
  })
    .populate('owner', 'name email avatarColor')
    .populate('members.user', 'name email avatarColor')
    .sort('-createdAt');

  res.status(200).json(boards);
});

// @desc    Get full board details with nested columns and tasks
// @route   GET /api/boards/:id
// @access  Private (Member+)
const getBoardById = asyncHandler(async (req, res) => {
  const boardId = req.params.id;

  const board = await Board.findById(boardId)
    .populate('owner', 'name email avatarColor')
    .populate('members.user', 'name email avatarColor');

  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }

  // Find columns sorted by order
  const columns = await Column.find({ board: boardId }).sort('order');

  // Find tasks sorted by order, populating assignee
  const tasks = await Task.find({ board: boardId })
    .sort('order')
    .populate('assignee', 'name email avatarColor');

  // Embed tasks inside their matching column objects
  const columnsWithTasks = columns.map((col) => {
    return {
      ...col.toObject(),
      tasks: tasks.filter(
        (t) => t.column && t.column.toString() === col._id.toString()
      ),
    };
  });

  res.status(200).json({
    _id: board._id,
    title: board.title,
    owner: board.owner,
    members: board.members,
    createdAt: board.createdAt,
    columns: columnsWithTasks,
  });
});

// @desc    Update board title
// @route   PUT /api/boards/:id
// @access  Private (Admin only)
const updateBoard = asyncHandler(async (req, res) => {
  const { title } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Please provide a board title');
  }

  // req.board was attached by checkBoardRole middleware
  const board = req.board;
  board.title = title;
  await board.save();

  const updatedBoard = await Board.findById(board._id)
    .populate('owner', 'name email avatarColor')
    .populate('members.user', 'name email avatarColor');

  res.status(200).json(updatedBoard);
});

// @desc    Delete board along with its columns and tasks (cascading delete)
// @route   DELETE /api/boards/:id
// @access  Private (Admin only)
const deleteBoard = asyncHandler(async (req, res) => {
  const boardId = req.params.id;

  // 1. Delete all associated columns
  await Column.deleteMany({ board: boardId });

  // 2. Delete all associated tasks
  await Task.deleteMany({ board: boardId });

  // 3. Delete the board document
  await Board.findByIdAndDelete(boardId);

  res.status(200).json({
    message: 'Board and all associated columns and tasks deleted successfully',
  });
});

// @desc    Add member to board members array
// @route   POST /api/boards/:id/members
// @access  Private (Admin only)
const addMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide a member email');
  }

  // Find user by email
  const userToAdd = await User.findOne({ email });
  if (!userToAdd) {
    res.status(404);
    throw new Error(`User with email "${email}" not found`);
  }

  const board = req.board;

  // Check if user is already a member
  const isAlreadyMember = board.members.some(
    (m) => m.user && m.user.toString() === userToAdd._id.toString()
  );

  if (isAlreadyMember) {
    res.status(400);
    throw new Error('User is already a member of this board');
  }

  // Push new member reference
  board.members.push({
    user: userToAdd._id,
    role: role || 'Member',
  });

  await board.save();

  // Log Activity
  await logActivity({
    board: board._id,
    user: req.user._id,
    action: 'add_member',
    details: `Invited member: ${userToAdd.name} (${userToAdd.email})`,
  });

  const updatedBoard = await Board.findById(board._id)
    .populate('owner', 'name email avatarColor')
    .populate('members.user', 'name email avatarColor');

  res.status(200).json(updatedBoard);
});

// @desc    Update user's board role
// @route   PUT /api/boards/:id/members/:userId
// @access  Private (Admin only)
const updateMemberRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const { userId } = req.params;

  if (!role) {
    res.status(400);
    throw new Error('Please specify a role');
  }

  const board = req.board;

  // Cannot modify role of board owner
  if (board.owner.toString() === userId) {
    res.status(400);
    throw new Error('Cannot change the role of the board owner');
  }

  // Find membership entry
  const member = board.members.find(
    (m) => m.user && m.user.toString() === userId
  );

  if (!member) {
    res.status(404);
    throw new Error('User is not a member of this board');
  }

  member.role = role;
  await board.save();

  // Log Activity
  const modifiedUser = await User.findById(userId);
  await logActivity({
    board: board._id,
    user: req.user._id,
    action: 'update_member_role',
    details: `Changed role of ${modifiedUser ? modifiedUser.name : 'member'} to ${role}`,
  });

  const updatedBoard = await Board.findById(board._id)
    .populate('owner', 'name email avatarColor')
    .populate('members.user', 'name email avatarColor');

  res.status(200).json(updatedBoard);
});

// @desc    Remove member from board members array
// @route   DELETE /api/boards/:id/members/:userId
// @access  Private (Admin only)
const removeMember = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const board = req.board;

  // Cannot remove board owner
  if (board.owner.toString() === userId) {
    res.status(400);
    throw new Error('Cannot remove the board owner from the board');
  }

  // Check if member exists
  const isMember = board.members.some(
    (m) => m.user && m.user.toString() === userId
  );

  if (!isMember) {
    res.status(404);
    throw new Error('User is not a member of this board');
  }

  // Filter out the member
  board.members = board.members.filter(
    (m) => m.user && m.user.toString() !== userId
  );

  // Unassign tasks assigned to this user on this board
  await Task.updateMany(
    { board: board._id, assignee: userId },
    { $unset: { assignee: '' } }
  );

  await board.save();

  // Log Activity
  const modifiedUser = await User.findById(userId);
  await logActivity({
    board: board._id,
    user: req.user._id,
    action: 'remove_member',
    details: `Removed member: ${modifiedUser ? modifiedUser.name : 'User'}`,
  });

  const updatedBoard = await Board.findById(board._id)
    .populate('owner', 'name email avatarColor')
    .populate('members.user', 'name email avatarColor');

  res.status(200).json(updatedBoard);
});

module.exports = {
  createBoard,
  getBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
  addMember,
  updateMemberRole,
  removeMember,
};
