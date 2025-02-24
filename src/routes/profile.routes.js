const express = require("express");
const User = require("../models/user.model");
const UserProfile = require("../models/userProfile.model");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/profiles - Get user profile (requires authentication)
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("profile")
      .select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching profile" });
  }
});

// PATCH /api/profiles/:userId /profile/- Get user profile (requires authentication)
router.patch("/:userId/profile", auth, async (req, res) => {
  const { age, bio, location } = req.body;
  const userId = req.params.userId;

  let user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "User  not found" });
  }

  // Create UserProfile
  const userProfile = new UserProfile({
    user: userId,
    age,
    bio,
    location,
  });
  try {
    const savedProfile = await userProfile.save();

    // Link profile to User
    user.profile = savedProfile._id;
    await user.save();

    res.status(201).json({
      id: savedProfile._id,
      age: savedProfile.age,
      bio: savedProfile.bio,
      location: savedProfile.location,
    });
  } catch (error) {
    res.status(500).json({ error: "Error saving user profile" });
  }
});
// GET /api/profiles/:userId/profile - Fetch user by ID
router.get("/:userId/profile", async (req, res) => {
  const userId = req.params.userId;

  try {
    // Find the user and populate the profile field with the UserProfile details
    const user = await User.findById(userId).populate("profile");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.profile) {
      return res.status(404).json({ error: "Profile not found for this user" });
    }

    // Return the user details along with the profile
    res.status(200).json({
      userName: user.userName,
      profile: user.profile, // This will contain the profile details (age, bio, location)
    });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving user profile" });
  }
});
module.exports = router;
