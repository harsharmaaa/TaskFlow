const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  members: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    role: { 
      type: String, 
      enum: ['Admin', 'Manager', 'Member'], 
      default: 'Member' 
    }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;
