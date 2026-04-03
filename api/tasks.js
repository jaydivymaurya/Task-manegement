const { Task, connectToDatabase } = require("../lib/db");

module.exports = async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === "GET") {
      const tasks = await Task.find().sort({ createdAt: -1 });
      return res.status(200).json({ tasks });
    }

    if (req.method === "POST") {
      const { title, details } = req.body || {};
      const cleanTitle = typeof title === "string" ? title.trim() : "";
      const cleanDetails = typeof details === "string" ? details.trim() : "";

      if (!cleanTitle) {
        return res.status(400).json({ error: "Task title is required." });
      }

      const task = await Task.create({
        title: cleanTitle,
        details: cleanDetails
      });

      return res.status(201).json({ task });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (_error) {
    return res.status(500).json({ error: "Could not process tasks right now." });
  }
};
