const mongoose = require("mongoose");

const PersonalTaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to User model
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String, // Changed status to String to represent different task statuses
    enum: ["toDo", "inProgress", "done"], // Added possible status values
    default: "toDo", // Default to 'toDo' if not provided
  },
});

const PersonalTask = mongoose.model("PersonalTask", PersonalTaskSchema);

module.exports = PersonalTask;
