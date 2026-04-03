require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/simple_task_manager";
let cachedConnection = null;

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    details: {
      type: String,
      trim: true,
      maxlength: 280,
      default: ""
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Task = mongoose.model("Task", taskSchema);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    target: MONGODB_URI.includes("mongodb+srv://") ? "atlas" : "local"
  });
});

app.get("/api/tasks", async (_req, res) => {
  try {
    await connectToDatabase();
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: "Could not load tasks right now." });
  }
});

app.post("/api/tasks", async (req, res) => {
  const { title, details } = req.body || {};
  const cleanTitle = typeof title === "string" ? title.trim() : "";
  const cleanDetails = typeof details === "string" ? details.trim() : "";

  if (!cleanTitle) {
    return res.status(400).json({ error: "Task title is required." });
  }

  try {
    await connectToDatabase();
    const task = await Task.create({
      title: cleanTitle,
      details: cleanDetails
    });

    res.status(201).json({ task });
  } catch (error) {
    res.status(500).json({ error: "Could not create the task." });
  }
});

app.patch("/api/tasks/:id", async (req, res) => {
  try {
    await connectToDatabase();
    const updates = {};

    if (typeof req.body.title === "string") {
      const cleanTitle = req.body.title.trim();
      if (!cleanTitle) {
        return res.status(400).json({ error: "Task title cannot be empty." });
      }
      updates.title = cleanTitle;
    }

    if (typeof req.body.details === "string") {
      updates.details = req.body.details.trim();
    }

    if (typeof req.body.completed === "boolean") {
      updates.completed = req.body.completed;
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: "Could not update the task." });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    await connectToDatabase();
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Could not delete the task." });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  cachedConnection = mongoose.connect(MONGODB_URI);
  return cachedConnection;
}

async function startServer() {
  try {
    await connectToDatabase();
    app.listen(PORT, HOST, () => {
      console.log(`Task manager running at http://${HOST}:${PORT}`);
      console.log(`Database target: ${MONGODB_URI.includes("mongodb+srv://") ? "MongoDB Atlas" : "Local MongoDB"}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = app;

if (require.main === module) {
  startServer();
}
