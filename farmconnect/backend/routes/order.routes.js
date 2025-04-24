const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { verifyToken, isFarmer } = require("../middleware/auth.middleware");

// Create a new order
router.post("/", verifyToken, orderController.createOrder);

// Get all orders for the user
router.get("/user", verifyToken, orderController.getUserOrders);

// Get all orders for the farmer (requires farmer role)
// This MUST come before the /:id route!
router.get("/farmer", [verifyToken, isFarmer], orderController.getFarmerOrders);

// Get specific order by ID
router.get("/:id", verifyToken, orderController.getOrderById);

// Cancel an order
router.patch("/:id/cancel", verifyToken, orderController.cancelOrder);

module.exports = router;
