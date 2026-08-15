const express = require('express');
const {
  createBoard,
  getBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
  addMember,
  updateMemberRole,
  removeMember,
} = require('../controllers/boardController');
const {
  getBoardActivity,
} = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');
const { checkBoardRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// Base Board Routes
router.route('/')
  .post(protect, createBoard)
  .get(protect, getBoards);

router.route('/:id')
  .get(protect, checkBoardRole('Member'), getBoardById)
  .put(protect, checkBoardRole('Admin'), updateBoard)
  .delete(protect, checkBoardRole('Admin'), deleteBoard);

// Board Membership Routes
router.route('/:id/members')
  .post(protect, checkBoardRole('Admin'), addMember);

router.route('/:id/members/:userId')
  .put(protect, checkBoardRole('Admin'), updateMemberRole)
  .delete(protect, checkBoardRole('Admin'), removeMember);

// Board Activity Feed Route
router.route('/:id/activity')
  .get(protect, checkBoardRole('Member'), getBoardActivity);

module.exports = router;
