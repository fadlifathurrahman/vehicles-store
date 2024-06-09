import express from "express";
import conn from "../db.js";
import authMiddleware from "../middlewares/auth-middleware.js";

// membuat route (dengan objek Router)
const router = express.Router();

router.use(authMiddleware);

// Route to add a new pricelist.
router.post("/addVehicle", async (req, res) => {
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

// Route to add a new vehicle type.
router.post("/addVehicleType", async (req, res) => {
  try {
    // Validasi setiap req.body tidak boleh ada yang kosong
    if (!req.body.name || !req.body.brandId) {
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
      `INSERT INTO 
        vehicle_types (name, brand_id) 
      VALUES 
        (?, (SELECT id FROM vehicle_brands WHERE id = ?))`
    );

    // Execute the prepared statement
    await prepare.execute([req.body.name, req.body.brandId]);

    // Send a response indicating that the type was added
    res.send("New vehicle type added.");
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

// Route to delete a vehicle
router.delete("/deleteVehicle", async (req, res) => {
  const id = req.query.id;

  // Check if the id is provided in the query string
  if (!id) {
    return res.status(400).send("Some required fields are missing.");
  }

  // Check if the id exists in the pricelist table
  const existingVehicle = await conn.query(
    "SELECT * FROM pricelists WHERE id = ? AND deleted_at IS NULL",
    [id]
  );
  if (existingVehicle.length === 0) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  // Update the deleted_at column with current datetime and set code and price to 0
  await conn.query(
    "UPDATE pricelists SET deleted_at = CURRENT_TIMESTAMP, code = 'Vehicle was deleted', price = 0 WHERE id = ?",
    [id]
  );

  res.status(200).json({ message: "Vehicle deleted successfully" });
});

// Route to delete a year
router.delete("/deleteVehicleYear", async (req, res) => {
  const id = req.query.id;

  // Check if the id is provided in the query string
  if (!id) {
    return res.status(400).send("Some required fields are missing.");
  }

  // Check if the id exists in the vehicle_years table
  const existingYear = await conn.query(
    "SELECT * FROM vehicle_years WHERE id = ? AND deleted_at IS NULL",
    [id]
  );
  if (existingYear.length === 0) {
    return res.status(404).json({ message: "Vehicle`s year not found" });
  }

  // Update the deleted_at column with current datetime if the year exists
  await conn.query(
    `UPDATE 
      vehicle_years 
    SET 
      deleted_at = CURRENT_TIMESTAMP, year = '0000' WHERE id = ?`,
    [id]
  );

  res.status(200).json({ message: "Vehicle year deleted successfully" });
});

// Route to delete a model
router.delete("/deleteVehicleModel", async (req, res) => {
  const id = req.query.id;

  // Check if the id is provided in the query string
  if (!id) {
    return res.status(400).send("Some required fields are missing.");
  }

  // Check if the id exists in the vehicle_models table
  const existingModel = await conn.query(
    "SELECT * FROM vehicle_models WHERE id = ? AND deleted_at IS NULL",
    [id]
  );
  if (existingModel.length === 0) {
    return res.status(404).json({ message: "Vehicle`s model not found" });
  }

  // Update the deleted_at column with current datetime if the model exists
  await conn.query(
    `UPDATE 
      vehicle_models 
    SET 
      deleted_at = CURRENT_TIMESTAMP, 
      name = 'Vehicle model is deleted' 
    WHERE 
      id = ?`,
    [id]
  );

  res.status(200).json({ message: "Vehicle model deleted successfully" });
});

// Route to delete a vehicle type
router.delete("/deleteVehicleType", async (req, res) => {
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

// Route to edit a vehicle
router.patch("/updateVehicle", async (req, res) => {
  try {
    // Validate required fields
    if (!req.query.id) {
      return res.status(400).send("Some required fields are missing.");
    }

    // Get the id from query string
    const id = req.query.id;

    // Check if the id exists in the pricelists table
    const existingPricelist = await conn.query(
      "SELECT * FROM pricelists WHERE id = ? AND deleted_at IS NULL",
      [id]
    );
    if (existingPricelist.length === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Validate optional fields
    const { newCode, newPrice, newYearId, newModelId } = req.body;

    // Check if newCode is not copied to another
    if (newCode) {
      const existingCode = await conn.query(
        "SELECT * FROM pricelists WHERE code = ? AND id != ? AND deleted_at IS NULL",
        [newCode, id]
      );
      if (existingCode.length > 0) {
        return res
          .status(409)
          .send("Vehicle with the same code already exists");
      }
    }

    // Check if newPrice is in numeric format
    if (newPrice && !/^\d+(\.\d+)?$/.test(newPrice)) {
      return res.status(400).send("Invalid price format");
    }

    // Check if newYearId and newModelId deleted_at in each table is null
    if (newYearId) {
      const existingYear = await conn.query(
        "SELECT * FROM vehicle_years WHERE id = ? AND deleted_at IS NULL",
        [newYearId]
      );
      if (existingYear.length === 0) {
        return res.status(400).send("Year`s id is invalid.");
      }
    }
    if (newModelId) {
      const existingModel = await conn.query(
        "SELECT * FROM vehicle_models WHERE id = ? AND deleted_at IS NULL",
        [newModelId]
      );
      if (existingModel.length === 0) {
        return res.status(400).send("Model`s id is invalid.");
      }
    }

    const fieldsToUpdate = [];
    const values = [];

    if (newCode) {
      fieldsToUpdate.push("code = ?");
      values.push(newCode);
    }
    if (newPrice) {
      fieldsToUpdate.push("price = ?");
      values.push(newPrice);
    }
    if (newYearId) {
      fieldsToUpdate.push("year_id = ?");
      values.push(newYearId);
    }
    if (newModelId) {
      fieldsToUpdate.push("model_id = ?");
      values.push(newModelId);
    }

    // Check if there are fields to update
    if (fieldsToUpdate.length === 0) {
      return res.status(400).send("No fields to update");
    }

    // Update the pricelist with the new values
    const updateQuery = `UPDATE pricelists SET ${fieldsToUpdate.join(
      ", "
    )} WHERE id = ?`;
    values.push(id);
    await conn.query(updateQuery, values);

    // Send a success response
    res.status(200).json({ message: "Vehicle updated successfully" });
  } catch (error) {
    // If there was an error, send a 500 status code with the error message
    res.status(500).send(error);
  }
});

// Route to update a vehicle year.
router.patch("/updateVehicleYear", async (req, res) => {
  const yearId = req.query.yearId;
  const newYear = req.body.newYear;

  try {
    // Validate required fields
    if (!yearId) {
      return res.status(400).send("Some required fields are missing.");
    }

    // Check if the id exists in the vehicle_years table
    const existingYear = await conn.query(
      "SELECT * FROM vehicle_years WHERE id = ? AND deleted_at IS NULL",
      [yearId]
    );
    if (existingYear.length === 0) {
      return res.status(404).json({ message: "Vehicle year not found" });
    }

    // Check if the newYear already exists in the vehicle_years table
    const existingYearWithNewValue = await conn.query(
      "SELECT * FROM vehicle_years WHERE year = ? AND deleted_at IS NULL",
      [newYear]
    );
    if (
      existingYearWithNewValue.length > 0 &&
      existingYearWithNewValue[0].id !== yearId
    ) {
      return res.status(409).json({ message: "Vehicle year already exists" });
    }

    // Update the vehicle year in the database
    const query = "UPDATE vehicle_years SET year = ? WHERE id = ?";
    await conn.query(query, [newYear || existingYear[0].year, yearId]);

    // Send a response indicating that the year was updated
    res.status(200).json({ message: "Vehicle year updated successfully" });
  } catch (error) {
    // If there was an error, send a 500 status code with the error message
    res.status(500).send(error);
  }
});

// Route to update a vehicle model.
router.patch("/updateVehicleModel", async (req, res) => {
  const modelId = req.query.modelId;
  const newModelName = req.body.newModelName;
  const newTypeId = req.body.newTypeId;

  try {
    // Validate required fields
    if (!modelId) {
      return res.status(400).send("Some required fields are missing.");
    }

    // Check if the id exists in the vehicle_models table
    const existingModel = await conn.query(
      "SELECT * FROM vehicle_models WHERE id = ? AND deleted_at IS NULL",
      [modelId]
    );
    if (existingModel.length === 0) {
      return res.status(404).json({ message: "Vehicle model not found" });
    }

    // Check if the brand name and model name already exist in the database
    if (newModelName) {
      const existingModelName = await conn.query(
        "SELECT * FROM vehicle_models WHERE name = ? AND deleted_at IS NULL",
        [newModelName]
      );
      if (existingModelName.length > 0) {
        return res
          .status(409)
          .json({ message: "Vehicle model name already exists" });
      }
    }

    // Check if the type_id exists in the vehicle_types table
    if (newTypeId) {
      const existingType = await conn.query(
        "SELECT * FROM vehicle_types WHERE id = ? AND deleted_at IS NULL",
        [newTypeId]
      );
      if (existingType.length === 0) {
        return res.status(404).json({ message: "Vehicle type not found" });
      }
    }

    // Prepare a statement to update the vehicle model in the database
    let updateQuery = ``;

    const params = [];
    if (newModelName && newTypeId) {
      updateQuery += `UPDATE vehicle_models SET name = ?, type_id = ? WHERE id = ?`;
      params.push(newModelName, newTypeId, modelId);
    } else if (newModelName) {
      updateQuery += `UPDATE vehicle_models SET name = ? WHERE id = ?`;
      params.push(newModelName, modelId);
    } else if (newTypeId) {
      updateQuery += `UPDATE vehicle_models SET type_id = ? WHERE id = ?`;
      params.push(newTypeId, modelId);
    } else {
      return res.status(400).send("newModelName or newTypeId is required.");
    }

    // Execute the update statement
    await conn.query(updateQuery, params);

    // Send a response indicating that the type was updated
    res.status(200).json({ message: "Vehicle model updated successfully" });
  } catch (error) {
    // If there was an error, send a 500 status code with the error message
    res.status(500).send(error);
  }
});

// Route to update a vehicle type or brand_id.
router.patch("/updateVehicleType", async (req, res) => {
  const typeId = req.query.typeId;
  const newTypeName = req.body.newTypeName;
  const newBrandId = req.body.newBrandId;

  try {
    // Validate required fields
    if (!typeId) {
      return res.status(400).send("Some required fields are missing.");
    }

    // Check if the id exists in the vehicle_types table
    const existingType = await conn.query(
      "SELECT * FROM vehicle_types WHERE id = ? AND deleted_at IS NULL",
      [typeId]
    );
    if (existingType.length === 0) {
      return res.status(404).json({ message: "Vehicle type not found" });
    }

    // Check if the brand name and model name already exist in the database
    if (newTypeName) {
      const existingTypeName = await conn.query(
        "SELECT * FROM vehicle_types WHERE name = ? AND deleted_at IS NULL",
        [newTypeName]
      );
      if (existingTypeName.length > 0) {
        return res
          .status(409)
          .json({ message: "Vehicle type name already exists" });
      }
    }

    // Check if the brand_id exists in the vehicle_brands table
    if (newBrandId) {
      const existingBrand = await conn.query(
        "SELECT * FROM vehicle_brands WHERE id = ? AND deleted_at IS NULL",
        [newBrandId]
      );
      if (existingBrand.length === 0) {
        return res.status(404).json({ message: "Vehicle brand not found" });
      }
    }

    // Prepare a statement to update the vehicle type in the database
    let updateQuery = ``;
    const params = [];
    if (newTypeName && newBrandId) {
      updateQuery += `UPDATE vehicle_types SET name = ?, brand_id = (SELECT id FROM vehicle_brands WHERE id = ? AND deleted_at IS NULL) WHERE id = ?`;
      params.push(newTypeName, newBrandId, typeId);
    } else if (newTypeName) {
      updateQuery += `UPDATE vehicle_types SET name = ? WHERE id = ?`;
      params.push(newTypeName, typeId);
    } else if (newBrandId) {
      updateQuery += `UPDATE vehicle_types SET brand_id = (SELECT id FROM vehicle_brands WHERE id = ? AND deleted_at IS NULL) WHERE id = ?`;
      params.push(newBrandId, typeId);
    } else {
      return res.status(400).send("newTypeName or newBrandId is required.");
    }

    // Execute the update statement
    await conn.query(updateQuery, params);

    // Send a response indicating that the type was updated
    res.status(200).json({ message: "Vehicle type updated successfully" });
  } catch (error) {
    // If there was an error, send a 500 status code with the error message
    res.status(500).send(error);
  }
});

// Route to update a brand
router.patch("/updateVehicleBrand", async (req, res) => {
  const brandId = req.query.brandId;
  const newBrandName = req.body.newBrandName;

  try {
    // Validasi setiap req.body tidak boleh kosong
    if (!brandId || !newBrandName) {
      return res
        .status(400)
        .json({ message: "Some required fields are missing." });
    }

    // Check if the brandId exists in the vehicle_brands table
    const existingBrand = await conn.query(
      "SELECT * FROM vehicle_brands WHERE id = ? AND deleted_at IS NULL",
      [brandId]
    );
    if (existingBrand.length === 0) {
      return res.status(400).json({ message: "BrandId is invalid." });
    }

    // Check if the newBrandName already exists in the database
    const existingBrandName = await conn.query(
      "SELECT * FROM vehicle_brands WHERE name = ? AND deleted_at IS NULL",
      [newBrandName]
    );
    if (existingBrandName.length > 0) {
      return res.status(409).json({ message: "Brand name already exists." });
    }

    // Update the brand name in the database
    const sql = `
      UPDATE vehicle_brands
      SET name = ?
      WHERE id = ?
    `;
    const values = [newBrandName, brandId];

    // Execute the update statement
    await conn.query(sql, values);

    // Send a response indicating that the brand was updated
    res.status(200).json({ message: "Brand updated successfully" });
  } catch (err) {
    // If there was an error, send a 500 status code with the error message
    console.error("Error updating brand:", err);
    res.status(500).send("Error updating brand");
  }
});

export default router;
