import express from "express";
import conn from "../db.js";

const router = express.Router();

// get all vehicles data
router.get("/", async (_req, res) => {
  const vehicles = await conn.query(
    "SELECT a.code, a.`price`, b.year, c.name AS model_name, d.name AS type_name, e.name AS brand_name FROM pricelists a, vehicle_years b, vehicle_models c, vehicle_types d, vehicle_brands e WHERE b.id = a.id AND c.`id` = d.`id` AND d.`id` = e.`id`;"
  );
  res.json(vehicles);
});

export default router;
