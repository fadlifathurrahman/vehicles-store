import express from "express";
import conn from "../db.js";

const router = express.Router();

// Get all pricelists data
router.get("/all", async (req, res) => {
  try {
    // Get limit and offset parameters from query string
    const limit = parseInt(req.query.limit) || 4; // Default limit 4
    const offset = parseInt(req.query.offset) || 0; // Default offset 0

    // Prepare SQL statement to query pricelists data
    const sql = `
      SELECT
        p.id,
        p.code,
        p.price,
        vy.year,
        vm.name AS model_name,
        vt.name AS type_name,
        vb.name AS brand_name
      FROM
        pricelists p
        JOIN vehicle_years vy ON p.year_id = vy.id
        JOIN vehicle_models vm ON p.model_id = vm.id
        JOIN vehicle_types vt ON vm.type_id = vt.id
        JOIN vehicle_brands vb ON vt.brand_id = vb.id
      ORDER BY p.code ASC
      LIMIT ? OFFSET ?
    `;

    // Execute prepared statement
    const result = await conn.query(sql, [limit, offset]);

    // Send response with pricelists data
    res.json({
      data: result,
      total: result.length, // Total data without pagination
      limit: limit,
      offset: offset,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while retrieving pricelists",
    });
  }
});

// Get pricelist data by id
router.get("/id/:id", async (req, res) => {
  const prepare = await conn.prepare(
    `SELECT
    p.id,
    p.code,
    p.price,
    vy.year,
    vm.name AS model_name,
    vt.name AS type_name,
    vb.name AS brand_name
  FROM
    pricelists p
    JOIN vehicle_years vy ON p.year_id = vy.id
    JOIN vehicle_models vm ON p.model_id = vm.id
    JOIN vehicle_types vt ON vm.type_id = vt.id
    JOIN vehicle_brands vb ON vt.brand_id = vb.id
  WHERE
    p.id = ?`
  );
  const pricelistById = await prepare.execute([req.params.id]);
  prepare.close();
  if (pricelistById[0]) {
    res.json(pricelistById[0]);
  } else {
    res.status(404);
    res.send("Id not found.");
  }
});

// Get all years data
router.get("/years", async (req, res) => {
  try {
    // Get limit and offset parameters from query string
    const limit = parseInt(req.query.limit) || 4; // Default limit 4
    const offset = parseInt(req.query.offset) || 0; // Default offset 0

    // Prepare SQL statement to query years data
    const sql = `SELECT 
        id,
        year
      FROM vehicle_years
      LIMIT ? OFFSET ?
    `;

    // Execute prepared statement
    const result = await conn.query(sql, [limit, offset]);

    // Send response with years data
    res.json({
      data: result,
      total: result.length, // Total data without pagination
      limit: limit,
      offset: offset,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while retrieving years",
    });
  }
});

// Get year data by id
router.get("/year/id/:id", async (req, res) => {
  // Prepare the SQL statement to get a year by id
  const prepare = await conn.prepare(
    "SELECT id, year FROM vehicle_years WHERE id = ?"
  );
  // Execute the prepared statement with the id from the request parameter
  const yearById = await prepare.execute([req.params.id]);
  prepare.close();
  // Check if the year is found
  if (yearById[0]) {
    res.json(yearById[0]);
  } else {
    res.status(404);
    res.send("Id not found.");
  }
});

// Get all vehicle-models data with optional type and brand parameters
router.get("/vehicle-models", async (req, res) => {
  try {
    // Get limit and offset parameters from query string
    const limit = Number(req.query.limit) || 4; // Default limit 4
    const offset = Number(req.query.offset) || 0; // Default offset 0
    const type = req.query.type || null;
    const brand = req.query.brand || null;

    // Prepare SQL statement to query vehicle-models data
    let sql = `
      SELECT 
        vm.id, 
        vm.name as model_name,
        vt.name AS type_name,
        vb.name AS brand_name
      FROM 
        vehicle_models vm
      JOIN vehicle_types vt ON vm.type_id = vt.id
      JOIN vehicle_brands vb ON vt.brand_id = vb.id
    `;
    const params = [];
    if (type) {
      sql += ` WHERE vt.name = ?`;
      params.push(type);
    }
    if (brand) {
      sql += brand ? ` AND vb.name = ?` : ` WHERE vb.name = ?`;
      params.push(brand);
    }
    sql += ` ORDER BY vm.name ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute prepared statement
    const result = await conn.query(sql, params);

    // Send response with vehicle-models data
    res.json({
      data: result.length > 0 ? result : [],
      total: result.length,
      limit: limit,
      offset: offset,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while retrieving vehicle-models",
    });
  }
});

// Get all vehicle-brands data
router.get("/vehicle-brands", async (req, res) => {
  try {
    // Get limit and offset parameters from query string
    const limit = parseInt(req.query.limit) || 4; // Default limit 4
    const offset = parseInt(req.query.offset) || 0; // Default offset 0

    // Prepare SQL statement to query vehicle-brands data
    const sql = `
      SELECT *
      FROM vehicle_brands 
      ORDER BY name ASC
      LIMIT ? OFFSET ?;
    `;

    // Execute prepared statement
    const result = await conn.query(sql, [limit, offset]);

    // Send response with vehicle-brands data
    res.json({
      data: result,
      total: result.length, // Total data without pagination
      limit: limit,
      offset: offset,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while retrieving vehicle-brands",
    });
  }
});

export default router;
