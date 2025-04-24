const { Cart } = require("../models/cart.model");
const { Product } = require("../models/product.model");

// Get the user's cart
exports.getCart = async (req, res) => {
  try {
    // Find or create cart for the current user
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.product",
      select: "name image farmer unit",
      populate: {
        path: "farmer",
        select: "username",
      },
    });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
      error: error.message,
    });
  }
};

// Add an item to the cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    // Find or create cart for the current user
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if the product is already in the cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (existingItemIndex !== -1) {
      // Update the quantity if the product is already in the cart
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add the new product to cart
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
      });
    }

    // Save the cart
    await cart.save();

    // Return the updated cart with populated product info
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name image farmer unit",
      populate: {
        path: "farmer",
        select: "username",
      },
    });

    res.status(200).json({
      success: true,
      cart: updatedCart,
      message: "Product added to cart",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
      error: error.message,
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    // Find cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;

    // Save the cart
    await cart.save();

    // Return the updated cart with populated product info
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name image farmer unit",
      populate: {
        path: "farmer",
        select: "username",
      },
    });

    res.status(200).json({
      success: true,
      cart: updatedCart,
      message: "Cart updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update cart",
      error: error.message,
    });
  }
};

// Remove an item from the cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Find cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Remove the item from the cart
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );

    // Save the cart
    await cart.save();

    // Return the updated cart with populated product info
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name image farmer unit",
      populate: {
        path: "farmer",
        select: "username",
      },
    });

    res.status(200).json({
      success: true,
      cart: updatedCart,
      message: "Item removed from cart",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
      error: error.message,
    });
  }
};

// Clear the cart
exports.clearCart = async (req, res) => {
  try {
    // Find cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Clear all items
    cart.items = [];

    // Save the cart
    await cart.save();

    res.status(200).json({
      success: true,
      cart,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};
