const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const Column = require('../models/Column');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { emitToUser } = require('../sockets/socketHandler');
const logActivity = require('../utils/logActivity');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Manager+)
const createTask = asyncHandler(async (req, res) => {
  const { board, column, title, description, assignee, priority, labels, dueDate, order } = req.body;

  // 1. Validation
  if (!board || !column || !title) {
    res.status(400);
    throw new Error('Please provide board, column, and title parameters');
  }

  // Verify column exists and belongs to the board
  const colExists = await Column.findOne({ _id: column, board });
  if (!colExists) {
    res.status(404);
    throw new Error('Target column not found on this board');
  }

  // 2. Set sorting order index
  // If not provided, fetch current task count in the column to append it to the end
  const currentCount = await Task.countDocuments({ column });
  const finalOrder = order !== undefined ? order : currentCount;

  // 3. Create task
  const task = await Task.create({
    board,
    column,
    title,
    description: description || '',
    assignee: assignee || null,
    priority: priority || 'Medium',
    labels: labels || [],
    dueDate: dueDate || null,
    order: finalOrder,
  });

  const populatedTask = await Task.findById(task._id).populate('assignee', 'name email avatarColor');

  // Log Activity
  await logActivity({
    board,
    task: task._id,
    user: req.user._id,
    action: 'create_task',
    details: `Created task: "${task.title}"`,
  });

  const io = req.app.get('io');
  if (io) {
    io.to(`board_${board}`).emit('task_created', populatedTask);
  }

  res.status(201).json(populatedTask);
});

// @desc    Update task details (except column move)
// @route   PUT /api/tasks/:id
// @access  Private (Manager+)
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, assignee, priority, labels, dueDate } = req.body;

  // req.task was attached by checkBoardRole middleware if cached
  const task = req.task || await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const previousTaskState = {
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate,
  };
  const previousAssignee = task.assignee ? task.assignee.toString() : null;

  // Update properties if provided
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (assignee !== undefined) task.assignee = assignee || null;
  if (priority !== undefined) task.priority = priority;
  if (labels !== undefined) task.labels = labels;
  if (dueDate !== undefined) task.dueDate = dueDate || null;

  await task.save();

  const populatedTask = await Task.findById(task._id).populate('assignee', 'name email avatarColor');

  // Trigger Notification if assignee changed and is not self
  if (assignee !== undefined) {
    const newAssignee = task.assignee ? task.assignee.toString() : null;
    if (newAssignee && newAssignee !== previousAssignee && newAssignee !== req.user._id.toString()) {
      try {
        const notification = await Notification.create({
          recipient: newAssignee,
          type: 'assigned',
          message: `${req.user.name} assigned you to the task "${task.title}"`,
          task: task._id,
        });

        const io = req.app.get('io');
        emitToUser(io, newAssignee, 'notification', notification);
      } catch (err) {
        console.error('Failed to create assignment notification:', err.message);
      }
    }
  }

  // Log Activity based on what changed
  const changes = [];
  if (title !== undefined && title !== previousTaskState.title) changes.push(`changed title to "${title}"`);
  if (description !== undefined && description !== previousTaskState.description) changes.push('updated description');
  if (assignee !== undefined && assignee !== previousAssignee) {
    if (assignee) {
      const assignedUser = await User.findById(assignee);
      changes.push(`assigned this task to ${assignedUser ? assignedUser.name : 'someone'}`);
    } else {
      changes.push('unassigned this task');
    }
  }
  if (priority !== undefined && priority !== previousTaskState.priority) changes.push(`changed priority to ${priority}`);
  if (labels !== undefined) changes.push('updated labels');
  if (dueDate !== undefined && (dueDate || '') !== (previousTaskState.dueDate ? previousTaskState.dueDate.toISOString().split('T')[0] : '')) {
    changes.push(dueDate ? `set due date to ${dueDate}` : 'cleared due date');
  }

  if (changes.length > 0) {
    await logActivity({
      board: task.board,
      task: task._id,
      user: req.user._id,
      action: 'update_task',
      details: changes.join(', '),
    });
  }

  const io = req.app.get('io');
  if (io) {
    io.to(`board_${task.board}`).emit('task_updated', populatedTask);
  }

  res.status(200).json(populatedTask);
});

// @desc    Move a task's position (column and/or order index)
// @route   PUT /api/tasks/:id/move
// @access  Private (Member+)
const moveTask = asyncHandler(async (req, res) => {
  const { column, order } = req.body;

  if (!column || order === undefined) {
    res.status(400);
    throw new Error('Please specify destination column and order index');
  }

  const task = req.task || await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const oldColumn = task.column.toString();
  const targetColumn = column.toString();

  // Update position
  task.column = column;
  task.order = order;
  await task.save();

  // Re-order databases indices for consistency (avoiding duplicates or gaps)
  if (oldColumn !== targetColumn) {
    // 1. Re-index original column (pull other tasks and sort them)
    const oldColTasks = await Task.find({ column: oldColumn, _id: { $ne: task._id } }).sort('order');
    for (let i = 0; i < oldColTasks.length; i++) {
      oldColTasks[i].order = i;
      await oldColTasks[i].save();
    }

    // 2. Re-index destination column
    const newColTasks = await Task.find({ column: targetColumn, _id: { $ne: task._id } }).sort('order');
    newColTasks.splice(order, 0, task);
    for (let i = 0; i < newColTasks.length; i++) {
      newColTasks[i].order = i;
      await newColTasks[i].save();
    }
  } else {
    // Re-index within the same column
    const colTasks = await Task.find({ column: targetColumn, _id: { $ne: task._id } }).sort('order');
    colTasks.splice(order, 0, task);
    for (let i = 0; i < colTasks.length; i++) {
      colTasks[i].order = i;
      await colTasks[i].save();
    }
  }

  // Return the moved task populated
  const populatedTask = await Task.findById(task._id).populate('assignee', 'name email avatarColor');

  // Log Activity
  const sourceCol = await Column.findById(oldColumn);
  const destCol = await Column.findById(targetColumn);
  await logActivity({
    board: task.board,
    task: task._id,
    user: req.user._id,
    action: 'move_task',
    details: `moved this task from ${sourceCol ? sourceCol.title : 'Column'} to ${destCol ? destCol.title : 'Column'}`,
  });

  const io = req.app.get('io');
  if (io) {
    io.to(`board_${task.board}`).emit('task_moved', {
      taskId: task._id,
      newColumn: column,
      newOrder: order,
    });
  }

  res.status(200).json(populatedTask);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Manager+)
const deleteTask = asyncHandler(async (req, res) => {
  const task = req.task || await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const columnId = task.column;

  // Log Activity
  await logActivity({
    board: task.board,
    task: task._id,
    user: req.user._id,
    action: 'delete_task',
    details: `deleted task "${task.title}"`,
  });

  // Delete the task document
  await Task.findByIdAndDelete(req.params.id);

  // Reorder remaining tasks in that column to fill the index gap
  const remainingTasks = await Task.find({ column: columnId }).sort('order');
  for (let i = 0; i < remainingTasks.length; i++) {
    remainingTasks[i].order = i;
    await remainingTasks[i].save();
  }

  const io = req.app.get('io');
  if (io) {
    io.to(`board_${task.board}`).emit('task_deleted', {
      taskId: task._id,
    });
  }

  res.status(200).json({ message: 'Task deleted and column index re-aligned successfully' });
});

// @desc    Upload file attachment to task
// @route   POST /api/tasks/:id/attachments
// @access  Private (Member+)
const uploadAttachment = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Push new attachment
  task.attachments.push({
    url: req.file.path,
    filename: req.file.originalname,
    uploadedBy: req.user._id,
  });

  await task.save();

  const populatedTask = await Task.findById(task._id)
    .populate('assignee', 'name email avatarColor')
    .populate('attachments.uploadedBy', 'name email avatarColor');

  // Log Activity
  await logActivity({
    board: task.board,
    task: task._id,
    user: req.user._id,
    action: 'upload_attachment',
    details: `added an attachment: ${req.file.originalname}`,
  });

  // Broadcast socket event
  const io = req.app.get('io');
  if (io) {
    io.to(`board_${task.board}`).emit('task_updated', populatedTask);
  }

  res.status(200).json(populatedTask);
});

module.exports = {
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  uploadAttachment,
};
