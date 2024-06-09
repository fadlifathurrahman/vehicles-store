// import jwt
import jwt from "jsonwebtoken";

// middleware otentikasi
function authMiddleware(req, res, next) {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      const user = jwt.verify(token, process.env.SECRET_KEY);

      console.log(user);
      if (user.is_admin) {
        req.user = user;
        next();
      } else {
        res.status(401);
        res.send("You are not an admin.");
      }
    } catch {
      res.status(401);
      res.send("Wrong token.");
    }
  } else {
    res.status(401);
    res.send("Empty token.");
  }
}
export default authMiddleware;
