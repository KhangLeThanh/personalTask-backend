const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const router = express.Router();

// POST /api/login - User login
router.post("/", async (req, res) => {
  const { userName, password } = req.body;

  const user = await User.findOne({ userName });
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }
  if (!user.status) {
    return res.status(403).json({ message: "Account is deactivated" });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = jwt.sign(
    { id: user._id, userName: user.userName },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 10 * 60 * 60 * 1000,
  });

  res.status(200).json({ user: { id: user._id, userName: user.userName } });
});

module.exports = router;
