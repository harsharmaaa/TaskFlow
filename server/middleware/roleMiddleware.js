const asyncHandler = require('express-async-handler');
const Board = require('../models/Board');

// Role hierarchy mapping
const ROLE_LEVELS = {
  'Member': 1,
  'Manager': 2,
  'Admin': 3
};

/**
 * Middleware factory to verify user's role on a specific board.
 * @param {string} minRole - The minimum role required ('Member', 'Manager', or 'Admin')
 */
const checkBoardRole = (minRole) => {
  return asyncHandler(async (req, res, next) => {
    // 1. Retrieve board ID from possible request locations
    let boardId = req.params.boardId || req.body.board;

    // If no boardId is found, but we have req.params.id, determine if it represents a Task ID
    if (!boardId && req.params.id) {
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        const Task = require('../models/Task');
        const task = await Task.findById(req.params.id);
        if (task) {
          boardId = task.board;
          req.task = task; // Cache the fetched task on the request
        } else {
          // Fallback to assuming the ID represents a Board ID
          boardId = req.params.id;
        }
      } else {
        boardId = req.params.id;
      }
    }

    if (!boardId) {
      res.status(400);
      throw new Error('Board ID is required for access validation');
    }

    // 2. Query the Board from the database
    const board = await Board.findById(boardId);
    if (!board) {
      res.status(404);
      throw new Error('Board not found');
    }

    const userIdStr = req.user._id.toString();
    let userRole = null;

    // 3. Check if the user is the Board owner (automatically Admin)
    if (board.owner.toString() === userIdStr) {
      userRole = 'Admin';
    } else {
      // 4. Find the user's role in the board members list
      const memberEntry = board.members.find(
        (m) => m.user && m.user.toString() === userIdStr
      );
      if (memberEntry) {
        userRole = memberEntry.role;
      }
    }

    // 5. If user has no role/membership on this board, deny access
    if (!userRole) {
      res.status(403);
      throw new Error('Access denied. You are not a member of this board');
    }

    // 6. Compare user's role level to the minimum required role level
    const userRoleLevel = ROLE_LEVELS[userRole] || 0;
    const minRoleLevel = ROLE_LEVELS[minRole] || 1; // Fallback to Member if unknown

    if (userRoleLevel < minRoleLevel) {
      res.status(403);
      throw new Error(`Access forbidden. Required role: ${minRole} or higher (Your role: ${userRole})`);
    }

    // 7. Attach the validated board object to the request for reuse down the line
    req.board = board;
    req.userBoardRole = userRole;

    next();
  });
};

module.exports = { checkBoardRole };
