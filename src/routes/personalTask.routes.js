const express = require("express");
const PersonalTask = require("../models/personalTask.model");
const User = require("../models/user.model");

const router = express.Router();

// POST /api/tasks/:userId/task - Add a new task
router.post("/:userId/task", async (req, res) => {
  const { title, content, status } = req.body;
  const userId = req.params.userId;

  let user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "User  not found" });
  }
  if (!title || !content) {
    return res
      .status(400)
      .json({ error: "All required fields must be filled" });
  }

  // Create a new task
  const personalTask = new PersonalTask({
    user: userId,
    title,
    content,
    status,
  });

  try {
    const savedTask = await personalTask.save();

    // Add the new task to the user's personalTasks array
    user.personalTasks.push(savedTask._id);
    await user.save();
    res.status(201).json({
      id: savedTask._id,
      title: savedTask.title,
      content: savedTask.content,
      status: savedTask.status,
    });
  } catch (error) {
    res.status(500).json({ error: "Error saving personal task" });
  }
});

// GET /api/tasks/:userId/task - Get Task details
router.get("/:userId/task/", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId).populate("personalTasks");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.personalTasks) {
      return res.status(404).json({ error: "Tasks not found for this user" });
    }
    // Return the user details along with the personal task
    res.status(200).json({
      userName: user.userName,
      personalTasks: user.personalTasks, // This will contain the profile details (age, bio, location)
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching task" });
  }
});

// PATCH /api/tasks/:userId/task - Update Task details
router.get("/:userId/task/", async (req, res) => {
  const { title, content, status } = req.body;
  const userId = req.params.userId;
  let user = await User.findById(userId);
  // Create PersonalTask
  const personalTask = new PersonalTask({
    user: userId,
    title,
    content,
    status,
  });
  try {
    const savedPersonalTask = await personalTask.save();

    // Link profile to User
    user.personalTasks = savedPersonalTask._id;
    await user.save();

    res.status(201).json({
      id: savedPersonalTask._id,
      title: savedPersonalTask.title,
      content: savedPersonalTask.content,
      status: savedPersonalTask.status,
    });
  } catch (error) {
    res.status(500).json({ error: "Error saving user profile" });
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
