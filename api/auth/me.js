const { connectToDatabase } = require("../../lib/db");
const { getAuthenticatedUser, sanitizeUser } = require("../../lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    await connectToDatabase();
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (_error) {
    return res.status(500).json({ error: "Could not load your profile right now." });
  }
};
