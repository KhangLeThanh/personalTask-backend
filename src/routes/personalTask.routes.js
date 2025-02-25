const express = require("express");
const PersonalTask = require("../models/personalTask.model");
const User = require("../models/user.model");

const router = express.Router();

// POST /api/tasks/:userId/task - Add a new task
router.post("/:userId/task", async (req, res) => {
  const { title, content, status } = req.body;
  const userId = req.params.userId;

  try {
    // Find the user by ID
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate required fields
    if (!title || !content) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled" });
    }

    // Create a new PersonalTask document
    const personalTask = new PersonalTask({
      user: userId,
      title,
      content,
      status,
    });

    const savedTask = await personalTask.save();

    // Ensure user has a personalTasks array (if it doesn't exist)
    if (!user.personalTasks) {
      user.personalTasks = [];
    }

    // Add the new task's ID to the user's personalTasks array
    user.personalTasks.push(savedTask._id);

    // Save the user document with the new task added
    await user.save();

    // Respond with the created task data
    res.status(201).json({
      id: savedTask._id,
      title: savedTask.title,
      content: savedTask.content,
      status: savedTask.status,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error saving personal task:", error);
    res
      .status(500)
      .json({ error: error.message || "Error saving personal task" });
  }
});

// GET /api/tasks/:userId/task - Get Task details
router.get("/:userId/task/", async (req, res) => {
  const userId = req.params.userId;
  const { status } = req.query; // Get status from query parameter

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create query object to filter tasks
    let query = { user: userId };
    if (status) {
      query.status = status; // Add status filter if provided
    }

    // Fetch tasks based on query
    const tasks = await PersonalTask.find(query);
    // Return the user details along with the personal task
    res.status(200).json({
      userName: user.userName,
      personalTasks: tasks, // This will contain the task details (title, content, status)
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching task" });
  }
});

router.patch("/:userId/task/:taskId", async (req, res) => {
  const { title, content, status } = req.body;
  const { userId, taskId } = req.params;

  try {
    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find and update the PersonalTask document
    const updatedPersonalTask = await PersonalTask.findOneAndUpdate(
      { _id: taskId, user: userId }, // The condition to find the task for this user
      { title, content, status }, // The fields to update
      { new: true } // Return the updated document
    );

    if (!updatedPersonalTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Send back the updated task (important: return the updated data)
    return res.status(200).json(updatedPersonalTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error updating user task" });
  }
});

// DELETE /api/tasks/:userId/task - Delete Task
router.delete("/:userId/task/:id", async (req, res) => {
  const { userId, id } = req.params;

  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find and delete the task
    const task = await PersonalTask.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Remove the task from the user's personalTasks array
    user.personalTasks = user.personalTasks.filter(
      (taskId) => taskId.id.toString() !== id
    );
    await user.save();

    res.status(200).json({
      message: "Task deleted successfully",
      userName: user.userName,
      personalTasks: user.personalTasks,
    });
  } catch (error) {
    res.status(500).json({ error: "Error deleting personal task" });
  }
});
module.exports = router;
