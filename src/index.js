// import dotenv for database configuration
import "dotenv/config";
// import express
import express from "express";
// import components
import vehicleroute from "./routes/vehicles.js";

// export express function
export const app = express();

// set up express app
const router = express.Router();
// user's routes
app.use("/api", router);
router.use("/pricelists", vehicleroute);

// set up server
const port = 3000;
app.listen(port, () => console.log(`Running in http://localhost:${port}`));
