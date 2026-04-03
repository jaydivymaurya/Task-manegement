require("dotenv").config();

const express = require("express");
const path = require("path");
const { MONGODB_URI, connectToDatabase, mongoose } = require("./lib/db");
const authLoginHandler = require("./api/auth/login");
const authMeHandler = require("./api/auth/me");
const authSignupHandler = require("./api/auth/signup");
const tasksHandler = require("./api/tasks");
const taskByIdHandler = require("./api/tasks/[id]");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    target: MONGODB_URI.includes("mongodb+srv://") ? "atlas" : "local"
  });
});

app.all("/api/auth/signup", authSignupHandler);
app.all("/api/auth/login", authLoginHandler);
app.all("/api/auth/me", authMeHandler);
app.all("/api/tasks", tasksHandler);
app.all("/api/tasks/:id", (req, res) => {
  req.query = { ...req.query, id: req.params.id };
  return taskByIdHandler(req, res);
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

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
