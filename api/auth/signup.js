const { connectToDatabase, User } = require("../../lib/db");
const { createToken, hashPassword, sanitizeUser } = require("../../lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    await connectToDatabase();

    const { name, email, password } = req.body || {};
    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanPassword = typeof password === "string" ? password : "";

    if (!cleanName || !cleanEmail || !cleanPassword) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    if (cleanPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash: hashPassword(cleanPassword)
    });

    const token = createToken(user);
    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (_error) {
    return res.status(500).json({ error: "Could not create your account right now." });
  }
};
