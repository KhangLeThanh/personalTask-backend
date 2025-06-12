const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

const router = express.Router();

// GET /api/users - Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

// POST /api/users - Add a new user
router.post("/", async (req, res) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res
      .status(400)
      .json({ error: "All required fields must be filled" });
  }

  const existingUser = await User.findOne({ userName });
  if (existingUser) {
    return res.status(400).json({ error: "Username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ userName, password: hashedPassword });

  try {
    const savedUser = await user.save();

    await savedUser.save();

    res.status(201).json({
      id: savedUser._id,
      userName: savedUser.userName,
    });
  } catch (error) {
    res.status(500).json({ error: "Error saving user" });
  }
});

// GET /api/users/:id - Fetch user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
  }
});

// Update /api/users/:id - Fetch user by ID
router.patch("/:id", async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      { status },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: "Task not found" });
    }
    return res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Error updating user" });
  }
});
module.exports = router;
