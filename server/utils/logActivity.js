const Activity = require('../models/Activity');

/**
 * Utility helper to log board-level or task-level activities.
 * 
 * @param {Object} params
 * @param {string|ObjectId} params.board - Board ID (Required)
 * @param {string|ObjectId} [params.task] - Task ID (Optional for board-only events)
 * @param {string|ObjectId} params.user - User ID who triggered the action (Required)
 * @param {string} params.action - String describing action (e.g. 'create_task', 'move_task')
 * @param {string} [params.details] - Detailed log description
 */
async function logActivity({ board, task, user, action, details }) {
  if (!board || !user || !action) {
    console.error('Cannot log activity: missing required fields (board, user, or action)');
    return null;
  }

  try {
    const activity = await Activity.create({
      board,
      task: task || null,
      user,
      action,
      details: details || '',
    });
    return activity;
  } catch (error) {
    console.error('Failed to log activity to database:', error.message);
    return null;
  }
}

module.exports = logActivity;
