// import jwt
import jwt from "jsonwebtoken";

// authentication middleware
const authenticationMiddleware = (req, res, next) => {
  // Extract the token from the request headers
  const token = req.headers.authorization?.split(" ")[1];

  // If no token is present, return 401 Unauthorized
  if (!token) {
    return res.status(401).send("Missing token");
  }

  try {
    // Decode the token using the SECRET_KEY environment variable
    const decodedUser = jwt.verify(token, process.env.SECRET_KEY);

    // If the token is expired, return 401 Unauthorized
    if (decodedUser.exp < Date.now() / 1000) {
      return res.status(401).send("Token expired");
    }

    // Add the decoded user object to the request object and proceed to the next middleware function
    req.user = decodedUser;
    next();
  } catch {
    // If the token is invalid, return 401 Unauthorized
    res.status(401).send("Invalid token");
  }
};
export default authenticationMiddleware;
