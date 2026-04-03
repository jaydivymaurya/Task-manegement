const { connectToDatabase, User } = require("../../lib/db");
const { createToken, sanitizeUser, verifyPassword } = require("../../lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    await connectToDatabase();

    const { email, password } = req.body || {};
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanPassword = typeof password === "string" ? password : "";

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: cleanEmail });

    if (!user || !verifyPassword(cleanPassword, user.passwordHash)) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = createToken(user);
    return res.status(200).json({ token, user: sanitizeUser(user) });
  } catch (_error) {
    return res.status(500).json({ error: "Could not log you in right now." });
  }
};
