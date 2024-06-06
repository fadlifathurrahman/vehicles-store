import express from "express";
import conn from "../db.js";

const router = express.Router();

// get all pricelists data
router.get("/all", async (_req, res) => {
  const pricelists = await conn.query(
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
    JOIN vehicle_brands vb ON vt.brand_id = vb.id`
  );
  res.json(pricelists);
});

// get all pricelists data with pagination
router.get("/limit=:limit/offset=:offset", async (req, res) => {
  const limit = parseInt(req.params.limit);
  const offset = parseInt(req.params.offset);
  const pricelists = await conn.query(
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
  LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  res.json(pricelists);
});

// get all pricelists data with filter year
router.get("/year/:year", async (req, res) => {
  const year = parseInt(req.params.year);
  const [pricelists] = await conn.execute(
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
    vy.year = ?`,
    [year]
  );
  res.json(pricelists);
});

// get pricelist data by id
router.get("/pricelistId/:id", async (req, res) => {
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
  if (pricelistById[0]) {
    res.json(pricelistById[0]);
  } else {
    res.status(404);
    res.send("Id not found.");
  }
});

export default router;

