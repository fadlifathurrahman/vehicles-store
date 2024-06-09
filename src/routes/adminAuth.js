import express from "express";
import conn from "../db.js";
import authMiddleware from "../middlewares/authMiddleware.js";

// membuat route (dengan objek Router)
const router = express.Router();

router.use(authMiddleware);

// Route to add a new vehicle brand.
router.post("/addVehicleBrand", async (req, res) => {
  try {
    // Check if the brand name already exists in the database
    const existingBrand = await conn.query(
      "SELECT * FROM vehicle_brands WHERE name = ?",
      [req.body.name]
    );
    if (existingBrand.length > 0) {
      return res.status(409).send("Brand name already exists.");
    }

    // Prepare a statement to insert a new brand into the database
    const prepare = await conn.prepare(
      "INSERT INTO vehicle_brands (name) VALUES (?)"
    );

    // Execute the prepared statement with the brand name from the request body
    await prepare.execute([req.body.name]);

    // Send a response indicating that the brand was added
    res.send("New brand added.");
  } catch (error) {
    // If there was an error, send a 500 status code with the error message
    res.status(500).send(error);
  }
});

// Route to add a new vehicle type.
router.post("/addVehicleType", async (req, res) => {
  try {
    // Check if the brand name and type name already exist in the database
    const existingType = await conn.query(
      "SELECT * FROM vehicle_types WHERE brand_id = ? AND name = ?",
      [req.body.brandId, req.body.name]
    );
    if (existingType.length > 0) {
      return res.status(409).send("Vehicle type already exists.");
    }

    // Prepare a statement to insert a new type into the database
    const prepare = await conn.prepare(
      "INSERT INTO vehicle_types (`name`, brand_id) VALUES (?, (SELECT id FROM vehicle_brands WHERE id = ?))"
    );

    // Execute the prepared statement with the type name and brand name from the request body
    await prepare.execute([req.body.name, req.body.brandId]);

    // Send a response indicating that the type was added
    res.send("New vehicle type added.");
  } catch (error) {
    // If there was an error, send a 500 status code with the error message
    res.status(500).send(error);
  }
});

router.delete("/deleteVehicleTypes", async (req, res) => {
  const id = req.query.id;
  
  // Check if the id exists in the vehicle_types table
  const existingType = await conn.query(
    "SELECT * FROM vehicle_types WHERE id = ?",
    [id]
  );
  if (existingType.length === 0) {
    return res.status(404).json({ message: "Vehicle type not found" });
  }

  // Delete the type from the vehicle_models table
  const modelDeletePrepare = await conn.prepare(
    "DELETE FROM vehicle_models WHERE type_id = ?"
  );
  await modelDeletePrepare.execute([id]);

  // Delete the type from the vehicle_types table
  const typeDeletePrepare = await conn.prepare(
    "DELETE FROM vehicle_types WHERE id = ?"
  );
  await typeDeletePrepare.execute([id]);

  res.status(200).json({ message: "Vehicle type deleted successfully" });
});

export default router;
