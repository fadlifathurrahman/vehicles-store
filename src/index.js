// import dotenv for database configuration
import "dotenv/config";
// import express
import express from "express";
// import auth
import adminAuthMiddleware from "./middlewares/admin-auth-middleware.js";
import nonAdminAuthMiddleware from "./middlewares/non-admin-auth-middleware.js";
import adminAuthRouter from "./routes/admin-auth.js";
import nonAdminAuthRouter from "./routes/non-admin-auth.js";

// import components
import vehicleRoute from "./routes/vehicles.js";
import users from "./routes/users.js";

// export express function
export const app = express();

// set up middleware
app.use(express.json());

// set up express app
const router = express.Router();
// user's routes
app.use("/api", router);
router.use("/pricelists", vehicleRoute);
router.use("/users", users);

// using middleware
router.use(nonAdminAuthMiddleware);
app.use("/userAuth/", nonAdminAuthRouter);

// using middleware
router.use(adminAuthMiddleware);
app.use("/adminAuth/", adminAuthRouter);

// set up server
const port = 3000;
app.listen(port, () => console.log(`Running in http://localhost:${port}`));
