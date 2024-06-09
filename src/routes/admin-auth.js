import express from "express";
import conn from "../db.js";
import authMiddleware from "../middlewares/auth-middleware.js";

// membuat route (dengan objek Router)
const router = express.Router();

router.use(authMiddleware);

// Route to add a new pricelist.
router.post("/addPricelist", async (req, res) => {
  try {
    // Check if the year_id, model_id, code, and price are not empty
    if (
      !req.body.yearId ||
      !req.body.modelId ||
      !req.body.code ||
      !req.body.price
    ) {
      return res.status(400).send("The request body cannot be empty.");
    }

    // Check if the year_id and model_id exists in the respective tables
    const year = await conn.query(
      "SELECT * FROM vehicle_years WHERE id = ? AND deleted_at IS NULL",
      [req.body.yearId]
    );
    if (year.length === 0) {
      return res.status(400).send("Year`s id is invalid.");
    }

    // Check if the model_id exists in the vehicle_models table
    const model = await conn.query(
      "SELECT * FROM vehicle_models WHERE id = ? AND deleted_at IS NULL",
      [req.body.modelId]
    );
    if (model.length === 0) {
      return res.status(400).send("Model`s id is invalid.");
    }

    // Check if the code already exists in the pricelists table
    const existingPricelist = await conn.query(
      "SELECT * FROM pricelists WHERE code = ?",
      [req.body.code]
    );
    if (existingPricelist.length > 0) {
      return res.status(409).send("Pricelist`s code already exists.");
    }

    // Check if the price is a numeric value
    if (!/^\d+(\.\d+)?$/.test(req.body.price)) {
      return res.status(400).send("Invalid price format");
    }

    // Prepare a statement to insert a new pricelist into the database
    const prepare = await conn.prepare(
      "INSERT INTO pricelists (`code`, price, year_id, model_id) VALUES (?, ?, ?, ?)"
    );

    // Execute the prepared statement with the values from the request body
    await prepare.execute([
      req.body.code,
      req.body.price,
      req.body.yearId,
      req.body.modelId,
    ]);

    // Send a response indicating that the pricelist was added
    res.send("New pricelist added.");
  } catch (error) {
    // If there was an error, send a 500 status code with the error message
    res.status(500).send(error);
  }
});

// Route to add a new vehicle year.
router.post("/addVehicleYear", async (req, res) => {
  try {
    // Check if the year is in the correct format
    const yearRegex = /^\d{4}$/; // Format: YYYY
    if (!yearRegex.test(req.body.year)) {
      return res
        .status(400)
        .send("Invalid year format. Please use the format YYYY.");
    }

    // Check if year is not empty
    if (!req.body.year) {
      return res.status(400).send("Year cannot be empty.");
    }

    const existingYear = await conn.query(
      "SELECT * FROM vehicle_years WHERE year = ?",
      [req.body.year]
    );
    if (existingYear.length > 0) {
      return res.status(409).send("Year already exists.");
    }

    // Prepare a statement to insert a new year into the database
    const prepare = await conn.prepare(
      "INSERT INTO vehicle_years `year` VALUES (?)"
    );

    // Execute the prepared statement with the year from the request body
    await prepare.execute([req.body.year]);

    // Send a response indicating that the year was added
    res.send("New year added.");
  } catch (error) {
    // If there was an error, send a 500 status code with the error message
    res.status(500).send(error);
  }
});

// Route to add a new vehicle brand.
router.post("/addVehicleBrand", async (req, res) => {
  try {
    // Check if the brand name is not empty
    if (!req.body.name) {
      return res.status(400).send("Brand name cannot be empty.");
    }

    // Check if the brand name already exists in the database
    const existingBrand = await conn.query(
      "SELECT * FROM vehicle_brands WHERE name = ?",
      [req.body.name]
    );
    if (existingBrand.length > 0) {
      return res.status(409).send("Brand`s name already exists.");
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
    // Validasi setiap req.body tidak boleh ada yang kosong
    if(!req.body.name || !req.body.brandId) {
      return res.status(400).send("Some required fields are missing.");
    }

    // Check if the brand_id exists in the vehicle_brands table
    const brand = await conn.query(
      "SELECT * FROM vehicle_brands WHERE id = ?",
      [req.body.brandId]
    );
    if (brand.length === 0) {
      return res.status(400).send("Brand`s id is invalid.");
    }

    // Check if the brand_id and type name already exist in the database
    const existingType = await conn.query(
      "SELECT * FROM vehicle_types WHERE name = ?",
      [req.body.name]
    );
    if (existingType.length > 0) {
      return res.status(409).send("Vehicle`s type already exists.");
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

// Route to add a new vehicle model.
router.post("/addVehicleModel", async (req, res) => {
  try {
    // Validasi setiap req.body tidak boleh ada yang kosong
    if (!req.body.name || !req.body.typeId) {
      return res.status(400).send("Some required fields are missing.");
    }

    // Check if the type_id exists in the vehicle_types table
    const existingType = await conn.query(
      "SELECT * FROM vehicle_types WHERE id = ? AND deleted_at IS NULL",
      [req.body.typeId]
    );
    if (existingType.length === 0) {
      return res.status(400).send("Type`s id is invalid.");
    }

    // Check if the brand name and model name already exist in the database
    const existingModel = await conn.query(
      "SELECT * FROM vehicle_models WHERE name = ?",
      [req.body.name]
    );
    if (existingModel.length > 0) {
      return res.status(409).send("Vehicle`s model already exists.");
    }

    // Prepare a statement to insert a new model into the database
    const prepare = await conn.prepare(
      "INSERT INTO vehicle_models (`name`, type_id) VALUES (?, (SELECT id FROM vehicle_types WHERE id = ?))"
    );

    // Execute the prepared statement with the model name and type name from the request body
    await prepare.execute([req.body.name, req.body.typeId]);

    // Send a response indicating that the model was added
    res.send("New vehicle`s model added.");
  } catch (error) {
    // If there was an error, send a 500 status code with the error message
    res.status(500).send(error);
  }
});

// Route to delete a vehicle type
router.delete("/deleteVehicleTypes", async (req, res) => {
  const id = req.query.id;

  // Check if the id is provided in the query string
  if (!id) {
    return res.status(400).send("Some required fields are missing.");
  }

  // Check if the id exists in the vehicle_types table
  const existingType = await conn.query(
    "SELECT * FROM vehicle_types WHERE id = ? AND deleted_at IS NULL",
    [id]
  );
  if (existingType.length === 0) {
    return res.status(404).json({ message: "Vehicle type not found" });
  }

  // Update the deleted_at column with current datetime if the type exists
  await conn.query(
    "UPDATE vehicle_types SET deleted_at = CURRENT_TIMESTAMP, name = 'Vehicle type is deleted' WHERE id = ?",
    [id]
  );

  res.status(200).json({ message: "Vehicle type deleted successfully" });
});


export default router;
