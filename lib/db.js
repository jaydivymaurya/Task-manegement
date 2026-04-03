require("dotenv").config();

const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/simple_task_manager";

let cachedConnection = null;

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
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

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true
    },
    passwordHash: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!cachedConnection) {
    cachedConnection = mongoose.connect(MONGODB_URI);
  }

  return cachedConnection;
}

module.exports = {
  MONGODB_URI,
  Task,
  User,
  connectToDatabase,
  mongoose
};
