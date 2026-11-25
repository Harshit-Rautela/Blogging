
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({
      msg: "No token, authorization denied.",
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      msg: "Authentication service is not configured.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (
      !decoded ||
      typeof decoded !== "object" ||
      typeof decoded.userId !== "string" ||
      !mongoose.isValidObjectId(decoded.userId)
    ) {
      return res.status(401).json({
        msg: "Invalid token payload.",
      });
    }

    req.user = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      msg: "Token is invalid or expired.",
    });
  }
};

export default auth;
