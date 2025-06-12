const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];

// Middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser requests
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // THIS enables Access-Control-Allow-Credentials: true
  })
);
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
app.use("/api/logout", require("./src/routes/logout.routes"));

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
