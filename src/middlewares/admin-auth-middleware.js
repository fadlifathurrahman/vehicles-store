// Import the jsonwebtoken library for token verification
import jwt from "jsonwebtoken";

// Define the middleware function
function adminAuthMiddleware(req, res, next) {
  // Check if the request has an authorization header
  if (req.headers.authorization) {
    // Extract the token from the authorization header
    const token = req.headers.authorization.split(" ")[1];
    try {
      // Verify the token using the secret key
      const { userId, is_admin } = jwt.verify(token, process.env.SECRET_KEY);

      // Check if the user is an admin
      if (is_admin) {
        // Attach the user object to the request object
        req.user = { id: userId, is_admin };
        // Call the next middleware function
        next();
      } else {
        // If the user is not an admin, send a 401 Unauthorized response
        res.status(401);
        res.send("Access forbidden.");
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
export default adminAuthMiddleware;
