const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('task', 'title board') // Optionally populate task details
    .sort({ createdAt: -1 })
    .limit(30);

  res.status(200).json(notifications);
});

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  // Ensure notification belongs to current user
  if (notification.recipient.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json(notification);
});

// @desc    Mark all notifications as read for current user
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  const updatedNotifications = await Notification.find({ recipient: req.user._id })
    .populate('task', 'title board')
    .sort({ createdAt: -1 })
    .limit(30);

  res.status(200).json(updatedNotifications);
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
