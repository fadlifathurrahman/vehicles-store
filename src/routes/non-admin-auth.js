// Import required modules
import express from "express";
import bcrypt from "bcrypt";
import conn from "../db.js"; // Import the database connection
import nonAdminAuthMiddleware from "../middlewares/non-admin-auth-middleware.js"; // Import the authentication middleware

// Create a router (using express.Router()) to define the routes
const router = express.Router();

// Use the authentication middleware to protect the routes to all routes in this router
router.use(nonAdminAuthMiddleware);

// Route to get current user
router.get("/me", (req, res) => {
  res.json(req.user);
});

// Route to update a user email
router.patch("/updateEmail", nonAdminAuthMiddleware, async (req, res) => {
  const { id } = req.user;
  const newEmail = req.body.newEmail;

  try {
    // Validate required fields
    if (!id || !newEmail) {
      return res
        .status(400)
        .json({ message: "Some required fields are missing." });
    }

    // Check if the email is already taken
    const existingUser = await conn.query(
      "SELECT * FROM users WHERE email = ? AND is_admin = 0 AND deleted_at IS NULL",
      [newEmail]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email is already taken." });
    }

    // Update the user email in the database
    const sql = `
          UPDATE users
          SET email = ?
          WHERE id = ?
        `;
    const values = [newEmail, id];

    // Execute the update statement
    await conn.query(sql, values);

    // Send a response indicating that the email was updated
    res.status(200).json({ message: "Email updated successfully" });
  } catch (err) {
    // If there was an error, send a 500 status code with the error message
    console.error("Error updating email:", err);
    res.status(500).send("Error updating email");
  }
});

// Route to update a user password
router.patch("/updatePassword", nonAdminAuthMiddleware, async (req, res) => {
  const { id } = req.user;
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;

  try {
    // Validate required fields
    if (!id || !currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Some required fields are missing." });
    }

    // Check if the userId exists in the users table
    const existingUser = await conn.query(
      "SELECT * FROM users WHERE id = ? AND is_admin = 0 AND deleted_at IS NULL",
      [id]
    );
    if (existingUser.length === 0) {
      return res.status(400).json({ message: "UserId is invalid." });
    }

    // Compare the current password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      existingUser[0].password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid current password." });
    }

    // Hash the new password before updating it in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user password in the database
    const sql = `
        UPDATE users
        SET password = ?
        WHERE id = ?
      `;
    const values = [hashedPassword, id];

    // Execute the update statement
    await conn.query(sql, values);

    // Send a response indicating that the brand was updated
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    // If there was an error, send a 500 status code with the error message
    console.error("Error updating password:", err);
    res.status(500).send("Error updating password");
  }
});

// Route to update a user name
router.patch("/updateName", nonAdminAuthMiddleware, async (req, res) => {
  const { id } = req.user;
  const newUserName = req.body.newUserName;

  try {
    // Validasi setiap req.body tidak boleh kosong
    if (!id || !newUserName) {
      return res
        .status(400)
        .json({ message: "Some required fields are missing." });
    }

    // Check if the userId exists in the users table
    const existingUser = await conn.query(
      "SELECT * FROM users WHERE id = ? AND is_admin = 0 AND deleted_at IS NULL",
      [id]
    );
    if (existingUser.length === 0) {
      return res.status(400).json({ message: "UserId is invalid." });
    }

    // Check if the newUserName is the same as the current user name
    if (newUserName === existingUser[0].name) {
      return res
        .status(409)
        .json({ message: "The new name is the same as the current name." });
    }

    // Update the user name in the database
    const sql = `
        UPDATE users
        SET name = ?
        WHERE id = ?
      `;
    const values = [newUserName, id];

    // Execute the update statement
    await conn.query(sql, values);

    // Send a response indicating that the brand was updated
    res.status(200).json({ message: "Name updated successfully" });
  } catch (err) {
    // If there was an error, send a 500 status code with the error message
    console.error("Error updating name:", err);
    res.status(500).send("Error updating name");
  }
});

// Route to delete a user account
router.delete("/deleteUser", nonAdminAuthMiddleware, async (req, res) => {
  const { id } = req.user;

  // Check if the userId is provided in the query string
  if (!id) {
    return res.status(400).send("Some required fields are missing.");
  }

  // Check if the userId exists in the users table
  const existingUser = await conn.query(
    "SELECT * FROM users WHERE id = ? AND deleted_at IS NULL AND is_admin = 0",
    [id]
  );
  if (existingUser.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  // Update the deleted_at column with current datetime and change user's name, email, and password if the user exists
  await conn.query(
    "UPDATE users SET deleted_at = CURRENT_TIMESTAMP, name = 'User is deleted', email = 'User is deleted', password = 'User is deleted' WHERE id = ?",
    [id]
  );
  res.status(200).json({ message: "User deleted successfully" });
});

// Export the router
export default router;
