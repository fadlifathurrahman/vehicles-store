// Import the jsonwebtoken library
import jwt from "jsonwebtoken";

// Define the middleware function
function nonAdminAuthMiddleware(req, res, next) {
  // Check if the request has an authorization header
  if (req.headers.authorization) {
    // Extract the token from the authorization header
    const token = req.headers.authorization.split(" ")[1];
    try {
      // Verify the token using the secret key
      const { userId, is_admin } = jwt.verify(token, process.env.SECRET_KEY);
      // Validate that the user is not an admin
      if (is_admin) {
        res.status(401);
        res.send("Access forbidden.");
      } else {
        // Attach the user id to the request object
        req.user = { id: userId };
        // Call the next middleware function
        next();
      }
    } catch {
      // If the token is invalid, send a 401 Unauthorized response
      res.status(401);
      res.send("Wrong token.");
    }
  } else {
    // If the token is missing, send a 401 Unauthorized response
    res.status(401);
    res.send("Empty token.");
  }
}

// Export the middleware function
export default nonAdminAuthMiddleware;

