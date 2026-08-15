const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET notifications & PUT mark all as read
router.route('/')
  .get(protect, getNotifications);

router.route('/read-all')
  .put(protect, markAllAsRead);

// PUT mark single as read
router.route('/:id/read')
  .put(protect, markAsRead);

module.exports = router;
