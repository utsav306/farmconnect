const { Order } = require("../models/order.model");
const { Cart } = require("../models/cart.model");
const { Product } = require("../models/product.model");

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod, deliveryMethod } = req.body;

    // Find user's cart
    const cart = await Cart.findOne({ user: req.userId }).populate({
      path: "items.product",
      populate: {
        path: "farmer",
        select: "username",
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Format order items from cart
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.price,
      quantity: item.quantity,
      farmer: item.product.farmer._id,
      farmerName: item.product.farmer.username,
      image: item.product.image,
      unit: item.product.unit || "kg",
    }));

    // Calculate subtotal
    const subtotal = cart.total;

    // Set delivery fee based on method
    const deliveryFee = deliveryMethod === "Pickup" ? 0 : 40;

    // Calculate total
    const total = subtotal + deliveryFee;

    // Estimate delivery time (for this example, it's just a string)
    const estimatedDelivery = getEstimatedDelivery(deliveryMethod);

    // Create order
    const order = new Order({
      user: req.userId,
      items: orderItems,
      deliveryAddress,
      paymentMethod,
      deliveryMethod,
      subtotal,
      deliveryFee,
      total,
      estimatedDelivery,
      status: "Confirmed",
    });

    // Save the order
    await order.save();

    // Clear the cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      order,
      message: "Order placed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// Get all orders for the current user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Get specific order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if the order belongs to the current user
    if (order.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this order",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

// Cancel an order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if the order belongs to the current user
    if (order.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this order",
      });
    }

    // Check if the order can be cancelled
    if (order.status !== "Confirmed" && order.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in ${order.status} state`,
      });
    }

    // Update order status
    order.status = "Cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      order,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

// Helper function to generate estimated delivery time
function getEstimatedDelivery(deliveryMethod) {
  const now = new Date();

  if (deliveryMethod === "Pickup") {
    return "Ready in 15 min";
  }

  // For home delivery, calculate delivery time (30-45 min from now)
  const deliveryStart = new Date(now.getTime() + 30 * 60000);
  const deliveryEnd = new Date(now.getTime() + 45 * 60000);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return `Today, ${formatTime(deliveryStart)} - ${formatTime(deliveryEnd)}`;
}

// Get all orders for the current farmer
exports.getFarmerOrders = async (req, res) => {
  try {
    // Set no-cache headers explicitly for this endpoint
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Log middleware details for debugging
    console.log("Auth user:", req.user ? req.user._id : "missing user");
    console.log("Auth userId:", req.userId);

    // Use userId from req.user directly if available, or req.userId
    const farmerId = req.user?._id || req.userId;

    if (!farmerId) {
      return res.status(400).json({
        success: false,
        message: "Farmer ID not found in request",
      });
    }

    console.log("Fetching orders for farmer ID:", farmerId);

    // Find all orders that contain items from this farmer
    const orders = await Order.find({
      "items.farmer": farmerId.toString(),
    }).sort({ createdAt: -1 });

    console.log(`Found ${orders.length} orders for farmer`);

    // Process orders to include farmerSubtotal
    const farmerOrders = orders.map((order) => {
      // Filter items that belong to this farmer
      const farmerItems = order.items.filter(
        (item) => item.farmer.toString() === farmerId.toString(),
      );

      // Calculate farmer subtotal for this order
      const farmerSubtotal = farmerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      // Create a copy of the order with additional data
      return {
        ...order.toObject(),
        farmerSubtotal,
        // Keep only items for this farmer
        items: farmerItems,
      };
    });

    res.status(200).json({
      success: true,
      orders: farmerOrders,
    });
  } catch (error) {
    console.error("Error fetching farmer orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch farmer orders",
      error: error.message,
    });
  }
};
