import conn from "../db.js"; // Import database connection
import bcrypt from "bcrypt"; // Import password hashing library
import express from "express"; // Import Express framework
import jwt from "jsonwebtoken"; // Import JSON Web Token library

const router = express.Router(); // Create Express router

// POST route for user login
router.post("/login", async (req, res) => {
  try {
    // Check if user is already logged in
    if (req.body.user) {
      return res.status(400).json({ message: "You are already logged in." });
    }
    // Check if email and password are present
    if (!req.body.email || !req.body.password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }
    // Query database for user with given email
    const user = await conn.query("SELECT * FROM users WHERE email = ?", [
      req.body.email,
    ]);

    // Check if user exists
    if (user.length === 0) {
      return res.status(401).send("Invalid email.");
    }
    // Check password match (non-hashing check)
    const match = req.body.password === user[0].password;
    if (!match) {
      return res.status(401).send("Invalid password.");
    }
    // // Check password match (hashing check)
    // const hashedPassword = await bcrypt.hash(req.body.password, 10);
    // if (hashedPassword !== user[0].password) {
    //   return res.status(401).send("Invalid password.");
    // }

    // Sign a token with user id and send it with user data
    const token = jwt.sign(
      { userId: user[0].id, is_admin: user[0].is_admin },
      process.env.SECRET_KEY
    );
    const userData = {
      token,
      user: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        is_admin: user[0].is_admin,
      },
    };

    // Send different responses based on user type
    if (user[0].is_admin) {
      res.json(userData);
    } else {
      res.json({
        ...userData,
        message: "Login as user",
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// POST route for user logout
router.post("/logout", (req, res) => {
  // Clear the session cookie
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// POST route for user registration
router.post("/register", async (req, res) => {
  // Validate required fields
  const requiredFields = ["name", "email", "password"];
  const missingFields = requiredFields.filter(
    (field) => !req.body || !req.body[field]
  );

  // Send error response if any required field is missing
  if (missingFields.length > 0) {
    return res.status(400).json({
      message: "Missing required fields:",
      missing: missingFields,
    });
  }

  // Check if email is already in use
  const email = await conn.query("SELECT * FROM users WHERE email = ?", [
    req.body.email,
  ]);

  if (email.length > 0) {
    return res.status(409).json({
      message: "Email already in use",
    });
  } else {
    try {
      // Hash password before inserting to database
      const hash = await bcrypt.hash(req.body.password, 10);
      // Insert new user data to database
      await conn.query(
        "INSERT INTO users (name, password, email, is_admin) VALUES (?, ?, ?, ?)",
        [req.body.name, hash, req.body.email, false]
      );

      res
        .status(200)
        .json({ message: "Your account is successfully created." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

// Export the router
export default router;
