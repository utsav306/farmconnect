const jwt = require("jsonwebtoken");
const { User } = require("../models/user.model");

// Verify JWT token middleware
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Verifying token:", token.substring(0, 10) + "...");

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded:", decoded);

    // Find user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    // Attach user to request object
    req.user = user;
    req.userId = user._id; // Add userId for backwards compatibility
    console.log("Auth middleware - set user:", user._id);
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(500).json({ message: "Authentication failed" });
  }
};

// Check for admin role
exports.isAdmin = (req, res, next) => {
  if (!req.user.roles.includes("admin")) {
    return res.status(403).json({ message: "Requires admin role" });
  }
  next();
};

// Check for moderator role
exports.isModerator = (req, res, next) => {
  if (
    !req.user.roles.includes("moderator") &&
    !req.user.roles.includes("admin")
  ) {
    return res.status(403).json({ message: "Requires moderator role" });
  }
  next();
};

// Check for farmer role
exports.isFarmer = (req, res, next) => {
  if (!req.user.roles.includes("farmer")) {
    return res.status(403).json({ message: "Requires farmer role" });
  }
  next();
};

// Check for specific roles
exports.hasRoles = (roles = []) => {
  return (req, res, next) => {
    const userRoles = req.user.roles;

    // Check if user has any of the required roles
    const hasRequiredRole = roles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({
        message: `Requires one of these roles: ${roles.join(", ")}`,
      });
    }

    next();
  };
};
