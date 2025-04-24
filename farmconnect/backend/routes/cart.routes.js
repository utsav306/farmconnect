const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// Apply auth middleware to all cart routes
router.use(verifyToken);

// Get user's cart
router.get("/", cartController.getCart);

// Add item to cart
router.post("/", cartController.addToCart);

// Update cart item quantity
router.put("/", cartController.updateCartItem);

// Remove item from cart
router.delete("/:productId", cartController.removeFromCart);

// Clear cart
router.delete("/clear", cartController.clearCart);

module.exports = router;
