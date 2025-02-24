// models/user.model.js
const mongoose = require("mongoose");

// Define the schema for the "User" model
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserProfile", // Reference to UserProfile model
  },
  personalTasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalTask", // Reference to PersonalTask model
    },
  ],
});

// Create the "User" model using the schema
const User = mongoose.model("User", userSchema);

module.exports = User; // Export the model to use in other parts of the app
