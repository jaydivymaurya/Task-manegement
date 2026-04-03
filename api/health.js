const { MONGODB_URI, mongoose } = require("../lib/db");

module.exports = async (_req, res) => {
  res.status(200).json({
    ok: true,
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    target: MONGODB_URI.includes("mongodb+srv://") ? "atlas" : "local"
  });
};
