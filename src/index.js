// import dotenv for database
import "dotenv/config";
// import express dan cors
import express from "express";

// import components
import vehicleroute from "./routes/vehicles.js";

// mengexport function express
export const app = express();

// using cors
const router = express.Router();
app.use("/api", router);
router.use("/vehicles", vehicleroute);

const port = 3000;
app.listen(port, () => console.log(`Running in http://localhost:${port}`));
