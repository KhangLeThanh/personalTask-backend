const express = require("express");
const PersonalTask = require("../models/personalTask.model");
const User = require("../models/user.model");

const router = express.Router();
// POST /api/tasks/:userId/task - Add a new task
router.post("/:userId/task", async (req, res) => {
  const { title, description, status } = req.body;
  const userId = req.params.userId;

  let user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "User  not found" });
  }
  if (!title || !description) {
    return res
      .status(400)
      .json({ error: "All required fields must be filled" });
  }

  // Create a new task
  const personalTask = new PersonalTask({
    user: userId,
    title,
    description,
    status: "toDO",
  });

  try {
    const savedTask = await personalTask.save();

    // Add the new task to the user's personalTasks array
    user.personalTasks.push(savedTask._id);
    await user.save();
    res.status(201).json({
      id: savedTask._id,
      title: savedTask.title,
      description: savedTask.description,
      status: savedTask.status,
    });
  } catch (error) {
    res.status(500).json({ error: "Error saving personal task" });
  }
});

module.exports = router;
