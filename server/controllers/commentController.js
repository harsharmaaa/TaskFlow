const asyncHandler = require('express-async-handler');
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Board = require('../models/Board');

// @desc    Add a comment to a task
// @route   POST /api/tasks/:id/comments
// @access  Private (Member+)
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error('Comment text cannot be empty');
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Parse @mentions
  const mentions = [];
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  let match;
  const matchedWords = [];
  while ((match = mentionRegex.exec(text)) !== null) {
    matchedWords.push(match[1].toLowerCase());
  }

  if (matchedWords.length > 0) {
    // Find board and populate members user details
    const board = await Board.findById(task.board).populate('members.user', 'name email');
    if (board) {
      board.members.forEach((member) => {
        if (member.user) {
          const fullNameNoSpaces = member.user.name.toLowerCase().replace(/\s+/g, '');
          const firstName = member.user.name.split(' ')[0].toLowerCase();
          const emailPrefix = member.user.email.toLowerCase().split('@')[0];

          const isMentioned = matchedWords.some(
            (word) =>
              word === fullNameNoSpaces ||
              word === firstName ||
              word === emailPrefix ||
              member.user.name.toLowerCase().includes(word)
          );

          if (isMentioned && !mentions.includes(member.user._id.toString())) {
            mentions.push(member.user._id);
          }
        }
      });
    }
  }

  const comment = await Comment.create({
    task: task._id,
    author: req.user._id,
    text: text.trim(),
    mentions,
  });

  const populatedComment = await Comment.findById(comment._id)
    .populate('author', 'name email avatarColor');

  // Emit real-time comment notification via Socket.io
  const io = req.app.get('io');
  if (io) {
    io.to(`board_${task.board}`).emit('comment_added', {
      taskId: task._id,
      comment: populatedComment,
    });
  }

  res.status(201).json(populatedComment);
});

// @desc    Get all comments for a task
// @route   GET /api/tasks/:id/comments
// @access  Private (Member+)
const getComments = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const comments = await Comment.find({ task: task._id })
    .populate('author', 'name email avatarColor')
    .sort({ createdAt: 1 }); // Sort chronologically (oldest first)

  res.status(200).json(comments);
});

module.exports = {
  addComment,
  getComments,
};
