const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const { verifyToken, isFarmer } = require("../middleware/auth.middleware");

// Get farmer dashboard data
router.get(
  "/farmer",
  [verifyToken, isFarmer],
  dashboardController.getFarmerDashboard,
);

module.exports = router;
