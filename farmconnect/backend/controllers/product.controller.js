const { Product } = require("../models/product.model");
const { User } = require("../models/user.model");
const mongoose = require("mongoose");

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    console.log(
      "Product creation attempt - Request body:",
      JSON.stringify(req.body),
    );
    console.log("Auth user:", req.user);

    // Check if user exists and has the farmer role
    if (!req.user) {
      console.error("No user found in request");
      return res.status(401).json({
        success: false,
        message: "Authentication required - no user found",
      });
    }

    if (!req.user.roles || !req.user.roles.includes("farmer")) {
      console.error("User is not a farmer:", req.user.roles);
      return res.status(403).json({
        success: false,
        message: "Only farmers can create products",
        roles: req.user.roles,
      });
    }

    const { name, description, price, image, category, stock, unit } = req.body;

    // Validate required fields
    if (!name || !price || !category || !image) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        required: ["name", "price", "category", "image"],
        received: req.body,
      });
    }

    // Set the farmer ID from the authenticated user
    const farmer = req.user._id;
    console.log("Creating product with farmer ID:", farmer);

    // Create a new product
    const product = new Product({
      name,
      description: description || "",
      price: parseFloat(price),
      image,
      category,
      stock: stock ? parseInt(stock) : 0,
      unit: unit || "kg",
      farmer,
    });

    console.log("Product data before save:", JSON.stringify(product));

    // Save the product
    await product.save();
    console.log("Product saved successfully:", product._id);

    res.status(201).json({
      success: true,
      product,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Product creation error:", error);

    // Check for validation errors
    if (error.name === "ValidationError") {
      const validationErrors = {};

      // Extract validation error messages
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }

      console.error("Validation errors:", validationErrors);

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create product: " + error.message,
      error: error.message,
    });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    // Set no-cache headers explicitly for this endpoint
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const { category, sort, limit = 20, page = 1 } = req.query;

    // Build query
    const query = { isActive: true };
    if (category) {
      query.category = category;
    }

    // Build sort options
    let sortOptions = {};
    if (sort === "price_asc") {
      sortOptions = { price: 1 };
    } else if (sort === "price_desc") {
      sortOptions = { price: -1 };
    } else if (sort === "newest") {
      sortOptions = { createdAt: -1 };
    } else if (sort === "rating") {
      sortOptions = { rating: -1 };
    } else {
      // Default sort by newest
      sortOptions = { createdAt: -1 };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find products
    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)
      .populate("farmer", "username");

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      products,
      totalProducts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProducts / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// Get a product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "farmer",
      "username email",
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, image, category, stock, unit, isActive } =
      req.body;

    // Check if product exists
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user is the farmer who created the product
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this product",
      });
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        image,
        category,
        stock,
        unit,
        isActive,
      },
      { new: true },
    );

    res.status(200).json({
      success: true,
      product: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Product update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    // Check if product exists
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user is the farmer who created the product
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this product",
      });
    }

    // Soft delete by setting isActive to false
    const deletedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Product deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

// Get products by farmer ID
exports.getProductsByFarmer = async (req, res) => {
  try {
    // Set no-cache headers explicitly for this endpoint
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const farmerId = req.params.farmerId || (req.user ? req.user._id : null);
    console.log("Fetching products for farmer ID:", farmerId);

    // Validate farmerId
    if (!farmerId) {
      console.error("No farmer ID provided and no authenticated user");
      return res.status(400).json({
        success: false,
        message: "Farmer ID is required",
      });
    }

    // Check if farmerId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      console.error("Invalid farmer ID format:", farmerId);
      return res.status(400).json({
        success: false,
        message: "Invalid farmer ID format",
      });
    }

    // Find products with detailed error handling
    try {
      const products = await Product.find({
        farmer: farmerId,
      }).sort({ createdAt: -1 });

      console.log(`Found ${products.length} products for farmer ${farmerId}`);

      res.status(200).json({
        success: true,
        products,
      });
    } catch (findError) {
      console.error("MongoDB query error:", findError);
      throw new Error(`Database query failed: ${findError.message}`);
    }
  } catch (error) {
    console.error("Error fetching farmer products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch farmer products: " + error.message,
      error: error.message,
    });
  }
};

// Test function for product creation - for diagnostic purposes
exports.testCreateProduct = async (req, res) => {
  try {
    console.log(
      "TEST PRODUCT CREATION - Request body:",
      JSON.stringify(req.body),
    );

    const { name, description, price, image, category, stock, unit } = req.body;
    const farmerId = req.params.farmerId;

    console.log(`Creating test product for farmer ID: ${farmerId}`);
    console.log(`Product category: ${category}`);

    // Validate required fields
    if (!name || !price || !stock || !category || !image) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        required: ["name", "price", "stock", "category", "image"],
        received: req.body,
      });
    }

    // Create test product
    const product = new Product({
      name,
      description: description || "",
      price: parseFloat(price),
      image,
      category,
      stock: parseInt(stock),
      unit: unit || "kg",
      farmer: farmerId,
    });

    console.log("Product data before save:", JSON.stringify(product));

    // Save the product
    await product.save();
    console.log("Test product saved successfully:", product._id);

    res.status(201).json({
      success: true,
      product,
      message: "Test product created successfully",
    });
  } catch (error) {
    console.error("Test product creation error:", error);

    // Check for validation errors
    if (error.name === "ValidationError") {
      const validationErrors = {};

      // Extract validation error messages
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }

      console.error("Validation errors:", validationErrors);

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create test product",
      error: error.message,
    });
  }
};

// Get products for the authenticated farmer
exports.getMyProducts = async (req, res) => {
  try {
    // Set no-cache headers explicitly for this endpoint
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      console.error("No authenticated user found");
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    console.log("Getting products for authenticated farmer:", req.user._id);

    // Get products for the authenticated farmer
    const products = await Product.find({
      farmer: req.user._id,
    }).sort({ createdAt: -1 });

    console.log(`Found ${products.length} products for authenticated farmer`);

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching farmer products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch farmer products",
      error: error.message,
    });
  }
};
