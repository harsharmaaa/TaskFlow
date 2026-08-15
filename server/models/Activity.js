const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  details: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
