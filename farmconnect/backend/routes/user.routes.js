const express = require("express");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validationMiddleware = require("../middleware/validation.middleware");
const { ROLES } = require("../models/user.model");

const router = express.Router();

// All routes below require authentication
router.use(authMiddleware.verifyToken);

// GET /api/users - Get all users (admin only)
router.get("/", authMiddleware.isAdmin, userController.getAllUsers);

// GET /api/users/:id - Get user by ID
router.get("/:id", userController.getUserById);

// PUT /api/users/:id - Update user
router.put(
  "/:id",
  validationMiddleware.updateUserValidation,
  validationMiddleware.validate,
  userController.updateUser,
);

// DELETE /api/users/:id - Delete user (admin only)
router.delete("/:id", authMiddleware.isAdmin, userController.deleteUser);

// PATCH /api/users/:id/roles - Change user roles (admin only)
router.patch(
  "/:id/roles",
  authMiddleware.isAdmin,
  userController.changeUserRoles,
);

module.exports = router;
