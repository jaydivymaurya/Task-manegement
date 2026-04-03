const { Task, connectToDatabase } = require("../../lib/db");

module.exports = async (req, res) => {
  const { id } = req.query;

  try {
    await connectToDatabase();

    if (req.method === "PATCH") {
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

      const task = await Task.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      });

      if (!task) {
        return res.status(404).json({ error: "Task not found." });
      }

      return res.status(200).json({ task });
    }

    if (req.method === "DELETE") {
      const task = await Task.findByIdAndDelete(id);

      if (!task) {
        return res.status(404).json({ error: "Task not found." });
      }

      return res.status(200).json({ success: true });
    }

    res.setHeader("Allow", "PATCH, DELETE");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (_error) {
    return res.status(500).json({ error: "Could not update this task right now." });
  }
};
