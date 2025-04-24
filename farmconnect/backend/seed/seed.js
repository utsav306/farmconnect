const mongoose = require("mongoose");
const { Product } = require("../models/product.model");
const { User, ROLES } = require("../models/user.model");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Sample products data
const products = [
  {
    name: "Organic Tomatoes",
    description:
      "Fresh organic tomatoes grown without pesticides. Rich in flavor and perfect for salads and cooking.",
    price: 2.99,
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
    category: "Vegetables",
    stock: 50,
    unit: "kg",
  },
  {
    name: "Fresh Apples",
    description:
      "Sweet and crunchy apples picked at peak ripeness. Great for snacking, baking, or making fresh juice.",
    price: 1.99,
    image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb",
    category: "Fruits",
    stock: 100,
    unit: "kg",
  },
  {
    name: "Organic Milk",
    description:
      "Creamy organic milk from grass-fed cows. No hormones or antibiotics. Pasteurized for safety.",
    price: 3.49,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150",
    category: "Dairy",
    stock: 30,
    unit: "liter",
  },
  {
    name: "Potatoes",
    description:
      "Farm-fresh potatoes perfect for roasting, mashing, or frying.",
    price: 1.49,
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
    category: "Vegetables",
    stock: 80,
    unit: "kg",
  },
  {
    name: "Carrots",
    description: "Sweet and crunchy carrots, rich in vitamins and minerals.",
    price: 1.29,
    image: "https://images.unsplash.com/photo-1447175008436-054170c2e979",
    category: "Vegetables",
    stock: 60,
    unit: "kg",
  },
];

// Function to seed the database
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Create a farmer user if it doesn't exist
    let farmer = await User.findOne({ email: "farmer@example.com" });

    if (!farmer) {
      const hashedPassword = await bcrypt.hash("password123", 10);

      farmer = new User({
        username: "farmer",
        email: "farmer@example.com",
        password: hashedPassword,
        roles: [ROLES.FARMER],
      });

      await farmer.save();
      console.log("Created farmer user");
    }

    // Delete existing products
    await Product.deleteMany({});
    console.log("Deleted existing products");

    // Add farmer ID to products
    const productsWithFarmer = products.map((product) => ({
      ...product,
      farmer: farmer._id,
    }));

    // Insert products
    await Product.insertMany(productsWithFarmer);
    console.log(`Inserted ${products.length} products`);

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the seed function
seedDatabase();
