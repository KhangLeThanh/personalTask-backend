const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(cors({ origin: "http://localhost:5173" }));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// Import and use routes
app.use("/api/users", require("./src/routes/users.routes"));
app.use("/api/profiles", require("./src/routes/profile.routes"));
app.use("/api/tasks", require("./src/routes/personalTask.routes"));
app.use("/api/login", require("./src/routes/auth.routes"));

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
