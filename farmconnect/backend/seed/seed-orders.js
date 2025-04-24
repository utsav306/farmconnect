const mongoose = require("mongoose");
const { Product } = require("../models/product.model");
const { User } = require("../models/user.model");
const { Order } = require("../models/order.model");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Farmer ID from the logs
const FARMER_ID = "6809473f9975ae5874af1741";

// Sample customer data
const customers = [
  {
    fullName: "John Doe",
    phoneNumber: "9876543210",
    address: "123 Main Street",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
  },
  {
    fullName: "Jane Smith",
    phoneNumber: "8765432109",
    address: "456 Oak Avenue",
    city: "Delhi",
    state: "Delhi",
    pincode: "110001",
  },
  {
    fullName: "Raj Patel",
    phoneNumber: "7654321098",
    address: "789 Pine Road",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560001",
  },
];

// Payment methods
const paymentMethods = ["cod", "card", "upi"];

// Order statuses
const statuses = ["pending", "processing", "shipped", "delivered"];

// Function to generate a random integer between min and max (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to get a random element from an array
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to generate a random date between start and end
function getRandomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

// Function to seed orders
async function seedOrders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find the farmer
    const farmer = await User.findById(FARMER_ID);
    if (!farmer) {
      console.error(`Farmer with ID ${FARMER_ID} not found`);
      return;
    }
    console.log(`Found farmer: ${farmer.username || farmer.email}`);

    // Find the farmer's products
    let productsForFarmer = await Product.find({ farmer: FARMER_ID });

    // If no products found, create some sample products
    if (productsForFarmer.length === 0) {
      console.log(
        "No products found for this farmer. Creating some products first...",
      );

      // Create some sample products for the farmer
      const sampleProducts = [
        {
          name: "Fresh Tomatoes",
          description: "Juicy, farm-fresh tomatoes harvested daily",
          price: 2.99,
          image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
          category: "Vegetables",
          stock: 50,
          unit: "kg",
          farmer: FARMER_ID,
        },
        {
          name: "Organic Potatoes",
          description: "Locally grown organic potatoes",
          price: 1.49,
          image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
          category: "Vegetables",
          stock: 100,
          unit: "kg",
          farmer: FARMER_ID,
        },
        {
          name: "Fresh Apples",
          description: "Sweet and crunchy apples from our orchard",
          price: 3.99,
          image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb",
          category: "Fruits",
          stock: 75,
          unit: "kg",
          farmer: FARMER_ID,
        },
      ];

      await Product.insertMany(sampleProducts);
      console.log(`Created ${sampleProducts.length} products for the farmer`);

      // Fetch the newly created products
      productsForFarmer = await Product.find({ farmer: FARMER_ID });
    }

    if (productsForFarmer.length === 0) {
      console.error("Failed to create or find products for the farmer");
      return;
    }

    console.log(`Found ${productsForFarmer.length} products for the farmer`);

    // Find or create some customer users
    let customers = await User.find({ roles: "customer" }).limit(3);
    if (customers.length < 3) {
      console.log("Creating some customer users...");

      // Only create the number of customers we need
      const numToCreate = 3 - customers.length;
      const newCustomers = [];

      for (let i = 0; i < numToCreate; i++) {
        const customer = new User({
          username: `customer${i + 1}`,
          email: `customer${i + 1}@example.com`,
          password:
            "$2a$10$Tpj0dU6wBVeQrwgBn1Kb8eOVv0x1bN1twBKzIi02W3yCgBcFEh/6O", // hashed password123
          roles: ["customer"],
        });

        newCustomers.push(customer);
      }

      if (newCustomers.length > 0) {
        await User.insertMany(newCustomers);
        console.log(`Created ${newCustomers.length} customer users`);
      }

      // Get the updated list of customers
      customers = await User.find({ roles: "customer" }).limit(3);
    }

    console.log(`Found ${customers.length} customers to create orders with`);

    // Create 5 random orders
    const orders = [];

    for (let i = 0; i < 5; i++) {
      const customer = getRandomElement(customers);
      const numItems = getRandomInt(1, 3);
      const orderItems = [];
      let subtotal = 0;

      // Add 1-3 random items to the order
      for (let j = 0; j < numItems; j++) {
        const product = getRandomElement(productsForFarmer);
        const quantity = getRandomInt(1, 5);

        // Debug log
        console.log(
          `Selected product: ${product.name}, price: ${product.price}`,
        );

        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          farmer: FARMER_ID,
          farmerName: farmer.username || farmer.email,
          image: product.image,
          unit: product.unit,
        });

        subtotal += product.price * quantity;
      }

      // Generate random delivery fee and calculate total
      const deliveryFee = getRandomInt(30, 100);
      const total = subtotal + deliveryFee;

      // Generate random address
      const customerInfo = getRandomElement(customers);
      const deliveryAddress = {
        fullName: customerInfo.username || "Customer",
        phoneNumber: "98" + getRandomInt(10000000, 99999999),
        address: `${getRandomInt(1, 999)} ${getRandomElement([
          "Main St",
          "Park Ave",
          "Oak Rd",
          "River Lane",
        ])}`,
        city: getRandomElement([
          "Mumbai",
          "Delhi",
          "Bangalore",
          "Chennai",
          "Kolkata",
        ]),
        state: getRandomElement([
          "Maharashtra",
          "Delhi",
          "Karnataka",
          "Tamil Nadu",
          "West Bengal",
        ]),
        pincode: getRandomInt(100000, 999999).toString(),
      };

      // Create random dates within the last month
      const now = new Date();
      const oneMonthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate(),
      );
      const orderDate = getRandomDate(oneMonthAgo, now);

      // Generate a unique order number - add milliseconds to make it more unique
      const orderNumber = `ORD-${Date.now()}-${i}`;

      const order = new Order({
        orderNumber: orderNumber,
        user: customer._id,
        items: orderItems,
        deliveryAddress: deliveryAddress,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total,
        status: getRandomElement(statuses),
        paymentMethod: getRandomElement(paymentMethods),
        paymentStatus: getRandomElement(["pending", "paid"]),
        estimatedDelivery: `${getRandomInt(1, 5)} days`,
        createdAt: orderDate,
        updatedAt: orderDate,
      });

      orders.push(order);
    }

    // Save the orders to the database
    // await Order.insertMany(orders);

    // Save the orders one by one
    for (const order of orders) {
      try {
        await order.save();
        console.log(`Created order with ID: ${order._id}`);
      } catch (error) {
        console.error(`Error creating order: ${error.message}`);
      }
    }

    console.log(`Created orders for the farmer`);

    console.log("Database seeded successfully with orders!");
  } catch (error) {
    console.error("Error seeding orders:", error);
    console.error(error.stack);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the seed function
seedOrders();
