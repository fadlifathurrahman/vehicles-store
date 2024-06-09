import express from "express";
import conn from "../db.js";

const router = express.Router();

// Get all pricelists data
router.get("/all", async (req, res) => {
  try {
    // Get limit and offset parameters from query string
    const limit = parseInt(req.query.limit) || 4; // Default limit 4
    const offset = parseInt(req.query.offset) || 0; // Default offset 0
    const pricelistId = req.query.modelId || null;
    const yearId = req.query.yearId || null;
    const modelId = req.query.modelId || null;
    const typeId = req.query.typeId || null;
    const brandId = req.query.brandId || null;

    // Prepare SQL statement to query pricelists data
    let sql = `
      SELECT
        p.id AS pricelist_id,
        p.code,
        p.price,
        vy.id AS year_id,
        vy.year,
        vm.id AS model_id,
        vm.name AS model_name,
        vt.id AS type_id,
        vt.name AS type_name,
        vb.id AS brand_id,
        vb.name AS brand_name
      FROM
        pricelists p
        JOIN vehicle_years vy ON p.year_id = vy.id
        JOIN vehicle_models vm ON p.model_id = vm.id
        JOIN vehicle_types vt ON vm.type_id = vt.id
        JOIN vehicle_brands vb ON vt.brand_id = vb.id
    `;

    const params = [];

    if (pricelistId) {
      sql += ` WHERE p.id = ?`;
      params.push(pricelistId);
    } else if (yearId) {
      sql += ` WHERE vy.id = ?`;
      params.push(yearId);
    } else if (modelId) {
      sql += ` WHERE vm.id = ?`;
      params.push(modelId);
    } else if (typeId) {
      sql += ` WHERE vt.id = ?`;
      params.push(typeId);
    } else if (brandId) {
      sql += ` WHERE vb.id = ?`;
      params.push(brandId);
    } else {
      sql += ` ORDER BY p.code ASC LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    // Execute prepared statement
    const result = await conn.query(sql, params);

    console.log(sql);

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

// Get all years data
router.get("/years", async (req, res) => {
  try {
    // Get limit and offset parameters from query string
    const limit = parseInt(req.query.limit) || 4; // Default limit 4
    const offset = parseInt(req.query.offset) || 0; // Default offset 0
    const yearId = req.query.yearId || null;
    const yearValue = req.query.yearValue || null;

    // Prepare SQL statement to query years data
    let sql = `SELECT 
        id,
        year
      FROM vehicle_years
    `;

    const params = [];

    if (yearId && yearValue) {
      sql += ` WHERE id = ? AND year = ?`;
      params.push(yearId, yearValue);
    } else if (yearId) {
      sql += ` WHERE id = ?`;
      params.push(yearId);
    } else if (yearValue) {
      sql += ` WHERE year = ?`;
      params.push(yearValue);
    } else {
      sql += ` ORDER BY year ASC LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    // Execute prepared statement
    const result = await conn.query(sql, params);

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

// Get all vehicle-models data with optional type and brand parameters
router.get("/vehicle-models", async (req, res) => {
  try {
    // Get limit and offset parameters from query string
    const limit = parseInt(req.query.limit) || 4; // Default limit 4
    const offset = parseInt(req.query.offset) || 0; // Default offset 0
    const modelId = req.query.modelId || null;
    const typeId = req.query.typeId || null;
    const brandId = req.query.brandId || null;

    // Prepare SQL statement to query vehicle-models data
    let sql = `
      SELECT 
        vm.id AS model_id, 
        vm.name as model_name,
        vt.id AS type_id,
        vt.name AS type_name,
        vb.id AS brand_id,
        vb.name AS brand_name
      FROM 
        vehicle_models vm
      JOIN 
        vehicle_types vt ON vm.type_id = vt.id
      JOIN 
        vehicle_brands vb ON vt.brand_id = vb.id
    `;
    const params = [];

    if (modelId && typeId && brandId) {
      sql += ` WHERE vm.id = ? AND vt.id = ? AND vb.id = ?`;
      params.push(modelId, typeId, brandId);
    } else if (modelId && typeId) {
      sql += ` WHERE vm.id = ? AND vt.id = ?`;
      params.push(modelId, typeId);
    } else if (modelId && brandId) {
      sql += ` WHERE vm.id = ? AND vb.id = ?`;
      params.push(modelId, brandId);
    } else if (typeId && brandId) {
      sql += ` WHERE vt.id = ? AND vb.id = ?`;
      params.push(typeId, brandId);
    } else if (modelId) {
      sql += ` WHERE vm.id = ?`;
      params.push(modelId);
    } else if (typeId) {
      sql += ` WHERE vt.id = ?`;
      params.push(typeId);
    } else if (brandId) {
      sql += ` WHERE vb.id = ?`;
      params.push(brandId);
    } else {
      sql += ` ORDER BY vm.name ASC LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

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

// Get all vehicle-types data with optional type and brand parameters
router.get("/vehicle-types", async (req, res) => {
  try {
    // Get limit and offset parameters from query string
    const limit = parseInt(req.query.limit) || 4; // Default limit 4
    const offset = parseInt(req.query.offset) || 0; // Default offset 0
    const typeId = req.query.typeId || null;
    const brandId = req.query.brandId || null;
    let sql = `
      SELECT 
        vt.id AS type_id, 
        vt.name AS type_name, 
        vb.id AS brand_id,
        vb.name AS brand_name
      FROM 
        vehicle_types vt
      JOIN vehicle_brands vb ON vt.brand_id = vb.id
    `;
    const params = [];

    if (typeId && brandId) {
      sql += ` WHERE vt.id = ? AND vb.id = ?`;
      params.push(typeId, brandId);
    } else if (typeId) {
      sql += ` WHERE vt.id = ?`;
      params.push(typeId);
    } else if (brandId) {
      sql += ` WHERE vb.id = ?`;
      params.push(brandId);
    } else {
      sql += ` ORDER BY vt.name ASC LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    const result = await conn.query(sql, params);

    res.json({
      data: result.length ? result : [],
      total: result.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while retrieving vehicle-types",
    });
  }
});

// Get vehicle-brands data by id and name with optional id and name parameters
router.get("/vehicle-brands", async (req, res) => {
  try {
    // Get limit and offset parameters from query string
    const limit = parseInt(req.query.limit) || 4; // Default limit 4
    const offset = parseInt(req.query.offset) || 0; // Default offset 0
    const brandId = req.query.brandId || null;
    const brandName = req.query.brandName || null;

    // Prepare SQL statement to query vehicle-brands data
    let sql = `
      SELECT 
        id AS brand_id, 
        name AS brand_name
      FROM 
        vehicle_brands
      WHERE 
        deleted_at IS NULL
    `;
    const params = [];

    if (brandId && brandName) {
      sql += ` AND id = ? AND name = ?`;
      params.push(brandId, brandName);
    } else if (brandId) {
      sql += ` AND id = ?`;
      params.push(brandId);
    } else if (brandName) {
      sql += ` AND name = ?`;
      params.push(brandName);
    } else {
      sql += ` ORDER BY name ASC LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    // Execute prepared statement
    const result = await conn.query(sql, params);
    console.log("sql: \n", sql);
    // Send response with vehicle-brands data
    res.json({
      data: result,
      total: result.length, // Total data without pagination
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while retrieving vehicle-brands",
    });
  }
});

export default router;
