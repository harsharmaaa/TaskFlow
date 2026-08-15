const express = require('express');
const {
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  uploadAttachment,
} = require('../controllers/taskController');
const {
  addComment,
  getComments,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const { checkBoardRole } = require('../middleware/roleMiddleware');
const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({ storage });
const router = express.Router();

// Base Task Routes
router.route('/')
  .post(protect, checkBoardRole('Manager'), createTask);

router.route('/:id')
  .put(protect, checkBoardRole('Manager'), updateTask)
  .delete(protect, checkBoardRole('Manager'), deleteTask);

// Relocate Task (drag and drop)
router.route('/:id/move')
  .put(protect, checkBoardRole('Member'), moveTask);

// Task Attachments
router.route('/:id/attachments')
  .post(protect, checkBoardRole('Member'), upload.single('file'), uploadAttachment);

// Task Comments
router.route('/:id/comments')
  .post(protect, checkBoardRole('Member'), addComment)
  .get(protect, checkBoardRole('Member'), getComments);

module.exports = router;
