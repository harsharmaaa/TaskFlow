const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  url: { 
    type: String, 
    required: true 
  },
  filename: { 
    type: String, 
    required: true 
  },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
});

const taskSchema = new mongoose.Schema({
  board: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Board', 
    required: true 
  },
  column: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Column', 
    required: true 
  },
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  assignee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  labels: [{ 
    type: String,
    trim: true
  }],
  dueDate: { 
    type: Date 
  },
  order: { 
    type: Number, 
    required: true 
  },
  attachments: [attachmentSchema],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
