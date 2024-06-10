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
      return res.status(401).send("Invalid email or password.");
    }

    // Check password match (hashing check)
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user[0].password
    );
    if (!isPasswordMatch) {
      return res.status(401).send("Invalid email or password.");
    }

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

// Route to register as an admin
router.post("/registerAdmin", async (req, res) => {
  try {
    // Check if the email, password, and name are not empty
    if (!req.body.email || !req.body.password || !req.body.name) {
      return res.status(400).send("The request body cannot be empty.");
    }

    // Validate email uniqueness
    const emailQuery = await conn.query("SELECT * FROM users WHERE email = ?", [
      req.body.email,
    ]);
    if (emailQuery.length > 0) {
      return res.status(409).send("Email already exists");
    }

    // Hash password before inserting to database
    const hash = await bcrypt.hash(req.body.password, 10);

    // Prepare a statement to insert a new user into the database
    const prepare = await conn.prepare(
      "INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)"
    );

    // Execute the prepared statement with the hashed password and is_admin value
    await prepare.execute([req.body.name, req.body.email, hash, 1]);

    // Send a response indicating that the user was added
    res.send("New admin added.");
  } catch (error) {
    // If there was an error, send a 500 status code with the error message
    res.status(500).send(error);
  }
});

// Export the router
export default router;
