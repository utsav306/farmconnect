const mongoose = require("mongoose");
const { User } = require("../models/user.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected for seeding"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Sample data
const categories = ["Vegetables", "Fruits", "Dairy", "Grains", "Herbs"];
const units = ["kg", "gm", "liter", "piece", "dozen", "bunch"];
const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

// Sample product images
const productImages = [
  "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2", // Tomatoes
  "https://images.unsplash.com/photo-1518977676601-b53f82aba655", // Potatoes
  "https://images.unsplash.com/photo-1508747703725-719777637510", // Onions
  "https://images.unsplash.com/photo-1544616326-38a74c8f87c8", // Apples
  "https://images.unsplash.com/photo-1550583724-b2692b85b150", // Milk
  "https://images.unsplash.com/photo-1513135467880-6c41603e0094", // Cheese
  "https://images.unsplash.com/photo-1589927986089-35812388d1f4", // Rice
  "https://images.unsplash.com/photo-1608440699553-8eb0e8a6adce", // Carrots
  "https://images.unsplash.com/photo-1557532422-b8c39a5a5bd1", // Cabbage
  "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716", // Corn
];

// Product names
const productNames = [
  "Fresh Tomatoes",
  "Organic Potatoes",
  "Red Onions",
  "Green Apples",
  "Organic Milk",
  "Artisan Cheese",
  "Basmati Rice",
  "Orange Carrots",
  "Green Cabbage",
  "Sweet Corn",
];

// Seed data
async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({ roles: "farmer" });
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Cart.deleteMany({});

    console.log("Cleared existing data");

    // Create farmer users
    const farmers = [];
    for (let i = 1; i <= 3; i++) {
      const farmer = new User({
        username: `farmer${i}`,
        email: `farmer${i}@example.com`,
        password: "password123",
        roles: ["farmer"],
        isActive: true,
      });
      await farmer.save();
      farmers.push(farmer);
      console.log(`Created farmer: ${farmer.username}`);
    }

    // Create customer users
    const customers = [];
    for (let i = 1; i <= 5; i++) {
      const customer = new User({
        username: `customer${i}`,
        email: `customer${i}@example.com`,
        password: "password123",
        roles: ["user"],
        isActive: true,
      });
      await customer.save();
      customers.push(customer);
      console.log(`Created customer: ${customer.username}`);
    }

    // Create products
    const products = [];
    for (let i = 0; i < 10; i++) {
      // Assign to random farmer
      const farmer = farmers[Math.floor(Math.random() * farmers.length)];

      const product = new Product({
        name: productNames[i],
        description: `High quality ${productNames[
          i
        ].toLowerCase()} from our farm.`,
        price: (Math.random() * 10 + 1).toFixed(2),
        image: productImages[i],
        category: categories[Math.floor(Math.random() * categories.length)],
        farmer: farmer._id,
        unit: units[Math.floor(Math.random() * units.length)],
        stock: Math.floor(Math.random() * 100) + 10,
        isActive: true,
      });

      await product.save();
      products.push(product);
      console.log(`Created product: ${product.name}`);
    }

    // Create carts for customers
    for (const customer of customers) {
      const cart = new Cart({
        user: customer._id,
        items: [],
      });
      await cart.save();
    }

    // Create orders (past 6 months)
    const now = new Date();
    for (let i = 0; i < 50; i++) {
      // Random customer
      const customer = customers[Math.floor(Math.random() * customers.length)];

      // Create random date in past 6 months
      const orderDate = new Date(now);
      orderDate.setMonth(orderDate.getMonth() - Math.floor(Math.random() * 6));
      orderDate.setDate(Math.floor(Math.random() * 28) + 1); // Random day 1-28

      // Random products (1-4 products per order)
      const numProducts = Math.floor(Math.random() * 4) + 1;
      const orderProducts = [];
      const productSet = new Set();

      for (let j = 0; j < numProducts; j++) {
        // Get random product, ensure no duplicates
        let product;
        do {
          product = products[Math.floor(Math.random() * products.length)];
        } while (productSet.has(product._id.toString()));

        productSet.add(product._id.toString());

        // Random quantity 1-5
        const quantity = Math.floor(Math.random() * 5) + 1;
        orderProducts.push({
          product: product._id,
          quantity,
          price: product.price,
        });
      }

      // Calculate total amount
      const totalAmount = orderProducts.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      // Random status (skew towards completed for older orders)
      let status;
      const monthsAgo = (now.getMonth() - orderDate.getMonth() + 12) % 12;
      if (monthsAgo > 3) {
        // Older orders more likely to be complete
        status =
          Math.random() < 0.9
            ? "delivered"
            : statuses[Math.floor(Math.random() * statuses.length)];
      } else if (monthsAgo > 1) {
        // Medium age orders
        status = statuses[Math.floor(Math.random() * statuses.length)];
      } else {
        // Recent orders less likely to be complete
        status = statuses[Math.floor(Math.random() * 3)]; // Only pending, processing, shipped
      }

      // Payment method
      const paymentMethods = ["cod", "card", "upi"];
      const paymentMethod =
        paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      // Create order
      const order = new Order({
        user: customer._id,
        items: orderProducts,
        address: {
          fullName: `${customer.username}'s Full Name`,
          phoneNumber: "9876543210",
          address: "123 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
        },
        totalAmount,
        status,
        paymentMethod,
        paymentStatus:
          status === "delivered"
            ? "paid"
            : paymentMethod === "cod"
            ? "pending"
            : "paid",
        deliveryMethod: Math.random() < 0.8 ? "standard" : "pickup",
        deliveryFee: 40,
        createdAt: orderDate,
        updatedAt: orderDate,
      });

      await order.save();
      console.log(
        `Created order #${order._id.toString().slice(-6)} for ${
          customer.username
        }`,
      );
    }

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
