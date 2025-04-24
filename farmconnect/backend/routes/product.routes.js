const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const {
  verifyToken,
  isModerator,
  isAdmin,
  isFarmer,
} = require("../middleware/auth.middleware");

// Get all products (public)
router.get("/", productController.getAllProducts);

// Get products for the authenticated farmer (requires auth and farmer role)
router.get(
  "/my-products",
  [verifyToken, isFarmer],
  productController.getMyProducts,
);

// Get a product by ID (public)
router.get("/:id", productController.getProductById);

// Get products by farmer (public)
router.get("/farmer/:farmerId", productController.getProductsByFarmer);

// TEST ROUTE - Create product with farmer id directly (no authentication required)
router.post("/test-create/:farmerId", productController.testCreateProduct);

// Protected routes below
// Create a product (farmer only)
router.post("/", verifyToken, productController.createProduct);

// Update a product (owner farmer only)
router.put("/:id", verifyToken, productController.updateProduct);

// Delete a product (owner farmer only)
router.delete("/:id", verifyToken, productController.deleteProduct);

module.exports = router;
