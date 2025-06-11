const express = require("express");
const PersonalTask = require("../models/personalTask.model");

const router = express.Router();

// POST /api/tasks - Add a new task
router.post("/", async (req, res) => {
  const { title, content, status, assignedTo, user } = req.body;

  try {
    // Validate required fields
    if (!title || !content || !user) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled" });
    }

    // Create a new PersonalTask document
    const personalTask = new PersonalTask({
      user,
      title,
      content,
      status,
      assignedTo,
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
      assignedTo: savedTask.assignedTo,
      user: savedTask.user,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error saving personal task:", error);
    res
      .status(500)
      .json({ error: error.message || "Error saving personal task" });
  }
});

// GET /api/tasks - Get Task details
router.get("/", async (req, res) => {
  const { status, assignedTo } = req.query;
  const query = {};

  try {
    if (status) {
      query.status = status; // Add status filter if provided
    }
    if (assignedTo) {
      const ids = assignedTo.split(",");
      query.assignedTo = { $in: ids }; // Add assignedTo filter if provided
    }
    // Fetch tasks based on query
    const tasks = await PersonalTask.find(query)
      .populate("user", "userName") // Only include userName from creator
      .populate("assignedTo", "userName"); // Only include userName from assignee
    // Return the user details along with the personal task
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Error fetching task" });
  }
});

router.patch("/:taskId", async (req, res) => {
  const { title, content, status, assignedTo } = req.body;
  const { taskId } = req.params;

  try {
    // Find and update the PersonalTask document
    const updatedPersonalTask = await PersonalTask.findOneAndUpdate(
      { _id: taskId }, // The condition to find the task for this user
      { title, content, status, assignedTo }, // The fields to update
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

// DELETE /api/tasks/:taskId/task - Delete Task
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find and delete the task
    const task = await PersonalTask.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully", task });
  } catch (error) {
    res.status(500).json({ error: "Error deleting personal task" });
  }
});
module.exports = router;
