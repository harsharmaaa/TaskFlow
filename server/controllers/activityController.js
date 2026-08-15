const asyncHandler = require('express-async-handler');
const Activity = require('../models/Activity');
const Task = require('../models/Task');
const Board = require('../models/Board');

// @desc    Get activity logs for a task
// @route   GET /api/tasks/:id/activity
// @access  Private (Member+)
const getTaskActivity = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const activities = await Activity.find({ task: task._id })
    .populate('user', 'name email avatarColor')
    .sort({ createdAt: -1 }); // Sorted newest first

  res.status(200).json(activities);
});

// @desc    Get activity logs for a board
// @route   GET /api/boards/:id/activity
// @access  Private (Member+)
const getBoardActivity = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);
  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }

  const activities = await Activity.find({ board: board._id })
    .populate('user', 'name email avatarColor')
    .populate('task', 'title') // Optionally populate task details to link back
    .sort({ createdAt: -1 })
    .limit(50); // Cap at last 50 events

  res.status(200).json(activities);
});

module.exports = {
  getTaskActivity,
  getBoardActivity,
};
