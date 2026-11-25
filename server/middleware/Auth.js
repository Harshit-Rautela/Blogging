
import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({
      msg: "No token, authorization denied",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return res.status(401).json({
        msg: "Invalid token payload",
      });
    }

    req.user = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      msg: "Token is invalid or expired",
    });
  }
};

export default auth;
