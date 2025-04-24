const mongoose = require("mongoose");
const { Product } = require("../models/product.model");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Farmer ID from the logs
const FARMER_ID = "6809473f9975ae5874af1741";

// Sample product data with better variety
const products = [
  {
    name: "Organic Broccoli",
    description:
      "Fresh, nutritious broccoli grown using organic methods. High in vitamins and fiber.",
    price: 75,
    image: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c",
    category: "Vegetables",
    stock: 40,
    unit: "kg",
    farmer: FARMER_ID,
    isActive: true,
  },
  {
    name: "Premium Strawberries",
    description:
      "Sweet, juicy strawberries picked at peak ripeness. Perfect for desserts or eating fresh.",
    price: 150,
    image: "https://images.unsplash.com/photo-1518635017498-87f514b751ba",
    category: "Fruits",
    stock: 25,
    unit: "kg",
    farmer: FARMER_ID,
    isActive: true,
  },
  {
    name: "Brown Rice",
    description:
      "Wholesome brown rice with all natural nutrients intact. Grown without chemical pesticides.",
    price: 65,
    image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6",
    category: "Grains",
    stock: 100,
    unit: "kg",
    farmer: FARMER_ID,
    isActive: true,
  },
  {
    name: "Fresh Paneer",
    description:
      "Homemade paneer made from farm-fresh milk. Soft texture and mild flavor, perfect for curries.",
    price: 220,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7",
    category: "Dairy",
    stock: 15,
    unit: "kg",
    farmer: FARMER_ID,
    isActive: true,
  },
  {
    name: "Organic Bell Peppers",
    description:
      "Colorful bell peppers grown organically. Sweet taste and crunchy texture, great for salads.",
    price: 90,
    image: "https://images.unsplash.com/photo-1594282486552-05a5f0b67e98",
    category: "Vegetables",
    stock: 30,
    unit: "kg",
    farmer: FARMER_ID,
    isActive: true,
  },
  {
    name: "Fresh Watermelon",
    description:
      "Juicy, refreshing watermelon perfect for hot summer days. Grown with minimal water usage.",
    price: 40,
    image: "https://images.unsplash.com/photo-1589984662646-e7b2e4962f18",
    category: "Fruits",
    stock: 12,
    unit: "piece",
    farmer: FARMER_ID,
    isActive: true,
  },
  {
    name: "Basmati Rice",
    description:
      "Premium quality basmati rice with authentic aroma. Ideal for biryanis and pulao.",
    price: 120,
    image: "https://images.unsplash.com/photo-1600441763908-443e79a0b477",
    category: "Grains",
    stock: 75,
    unit: "kg",
    farmer: FARMER_ID,
    isActive: true,
  },
  {
    name: "Organic Honey",
    description:
      "Pure, unprocessed honey from our farm's beehives. Rich in antioxidants and natural enzymes.",
    price: 320,
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924",
    category: "Fruits",
    stock: 20,
    unit: "kg",
    farmer: FARMER_ID,
    isActive: true,
  },
  {
    name: "Farm-Fresh Eggs",
    description:
      "Free-range eggs from hens raised on natural feed. Rich yellow yolks and superior taste.",
    price: 90,
    image: "https://images.unsplash.com/photo-1598965675045-45c5e72c7d05",
    category: "Dairy",
    stock: 50,
    unit: "dozen",
    farmer: FARMER_ID,
    isActive: true,
  },
  {
    name: "Seasonal Mix Vegetables",
    description:
      "Assorted seasonal vegetables harvested daily. The perfect way to get variety in your meals.",
    price: 150,
    image: "https://images.unsplash.com/photo-1573246123716-6b1782bfc499",
    category: "Vegetables",
    stock: 0,
    unit: "kg",
    farmer: FARMER_ID,
    isActive: true,
  },
  {
    name: "Sweet Mangoes",
    description:
      "Alphonso mangoes known for their sweetness and flavor. Limited seasonal availability.",
    price: 250,
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078",
    category: "Fruits",
    stock: 0,
    unit: "kg",
    farmer: FARMER_ID,
    isActive: false,
  },
  {
    name: "Fresh Ginger",
    description:
      "Organic ginger root with intense flavor. Great for cooking and making medicinal teas.",
    price: 80,
    image: "https://images.unsplash.com/photo-1573414404860-a56425653368",
    category: "Vegetables",
    stock: 20,
    unit: "kg",
    farmer: FARMER_ID,
    isActive: true,
  },
];

// Function to seed the database
async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get existing products for this farmer
    const existingProducts = await Product.find({ farmer: FARMER_ID });
    console.log(
      `Found ${existingProducts.length} existing products for farmer ${FARMER_ID}`,
    );

    // Only add new products to avoid duplicates
    // Create a simple check based on product names
    const existingProductNames = existingProducts.map((p) =>
      p.name.toLowerCase().trim(),
    );

    const newProducts = products.filter(
      (product) =>
        !existingProductNames.includes(product.name.toLowerCase().trim()),
    );

    if (newProducts.length === 0) {
      console.log(
        "No new products to add. All product names already exist in the database.",
      );
      return;
    }

    // Insert new products
    const result = await Product.insertMany(newProducts);
    console.log(`Added ${result.length} new products to the database`);

    // Log the names of added products
    console.log("Added products:");
    result.forEach((product) => console.log(`- ${product.name}`));

    console.log("Database seeded successfully with products!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the seed function
seedProducts();
