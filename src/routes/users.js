import conn from "../db.js";
import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const user = await conn.query("SELECT * FROM users WHERE email = ?", [
      req.body.email,
    ]);

    if (user.length === 0) {
      return res.status(401).send("Invalid email.");
    }
    // non-hashing check
    const match = req.body.password === user[0].password;
    if (!match) {
      return res.status(401).send("Invalid password.");
    }
    
    // hashing check
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

router.post("/register", async (req, res) => {
  // Validate required fields (improved clarity and error handling)
  const requiredFields = ["name", "email", "password"];
  const missingFields = requiredFields.filter(
    (field) => !req.body || !req.body[field]
  );

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
      // Hashing passwaord before insert to database
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

export default router;
