const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { User, ROLES } = require("../models/user.model");

// Load environment variables
dotenv.config({ path: "../.env" });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/auth_db")
  .then(() => {
    console.log("Connected to MongoDB");
    seedDatabase();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Sample users data
const users = [
  {
    username: "admin",
    email: "admin@example.com",
    password: "Admin123",
    roles: [ROLES.ADMIN, ROLES.USER],
  },
  {
    username: "moderator",
    email: "moderator@example.com",
    password: "Moderator123",
    roles: [ROLES.MODERATOR, ROLES.USER],
  },
  {
    username: "user",
    email: "user@example.com",
    password: "User123",
    roles: [ROLES.USER],
  },
];

// Seed the database
async function seedDatabase() {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log("Deleted existing users");

    // Create new users
    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users:`);

    createdUsers.forEach((user) => {
      console.log(
        `- ${user.username} (${user.email}) with roles: ${user.roles.join(
          ", ",
        )}`,
      );
    });

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}
