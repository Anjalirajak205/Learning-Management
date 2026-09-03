const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {

    // Get authorization header
    const authHeader = req.headers.authorization;

    // Check token exists
    if (!authHeader) {
      return res.status(401).json({
        message: "Not authorized. Please login."
      });
    }

    // Expected format:
    // Bearer TOKEN

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token not found"
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Store decoded user information
    req.user = decoded;

    // Continue
    next();

  } catch (error) {

    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = protect;