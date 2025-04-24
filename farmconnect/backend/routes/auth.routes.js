const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validationMiddleware = require("../middleware/validation.middleware");

const router = express.Router();

// POST /api/auth/register - Register a new user
router.post(
  "/register",
  validationMiddleware.registerValidation,
  validationMiddleware.validate,
  authController.register,
);

// POST /api/auth/login - Login user
router.post(
  "/login",
  validationMiddleware.loginValidation,
  validationMiddleware.validate,
  authController.login,
);

// GET /api/auth/me - Get current user profile (protected)
router.get("/me", authMiddleware.verifyToken, authController.getCurrentUser);

// POST /api/auth/change-password - Change password (protected)
router.post(
  "/change-password",
  authMiddleware.verifyToken,
  authController.changePassword,
);

module.exports = router;
