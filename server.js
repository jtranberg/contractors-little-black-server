const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./api/routes/auth");
const loginRoutes = require("./api/routes/login");

const app = express();

/**
 * ✅ CORS for Vite (5173) + Netlify + Render
 * Add your Netlify URL when you deploy the web frontend.
 */
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://contractors-little-black-book-web.netlify.app",
];

app.use(
  cors({
    origin: (origin, cb) => {
      // allow tools like curl/postman (no origin)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api", loginRoutes);
app.use("/api/customers", require("./api/routes/customers"));

// Mongo
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

// Start
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server is running on port ${port}`));
