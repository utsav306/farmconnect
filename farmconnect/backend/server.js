const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const cartRoutes = require("./routes/cart.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const aiRoutes = require("./routes/ai.routes");
const os = require("os");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add cache control middleware to prevent 304 responses
app.use((req, res, next) => {
  // Set headers to prevent caching
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Serve static files from the public directory
app.use(express.static("public"));

app.use(morgan("dev"));

// Routes
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Add error handling middleware at the end of your middleware section
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Server error occurred",
    error:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

// Get local IP address for network access
const getLocalIpAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip over non-IPv4 and internal (loopback) addresses
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost"; // Fallback
};

// Get the local IP address
const localIp = process.env.LOCAL_IP || getLocalIpAddress();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    // Start server
    const PORT = process.env.PORT || 5000;
    const HOST = "0.0.0.0"; // Listen on all available network interfaces
    app.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
      console.log(
        `For local development, access via http://localhost:${PORT}/api`,
      );
      console.log(
        `For Android Emulator, access via http://10.0.2.2:${PORT}/api`,
      );
      console.log(`For iOS Simulator, access via http://localhost:${PORT}/api`);
      console.log(
        `For physical devices, access via http://${localIp}:${PORT}/api (your computer's IP)`,
      );
      console.log(
        "Make sure your mobile device is on the same WiFi network as your computer",
      );

      // Store the URLs in environment variables (for access by other parts of the app)
      process.env.API_URL = `http://localhost:${PORT}/api`;
      process.env.ANDROID_EMULATOR_URL = `http://10.0.2.2:${PORT}/api`;
      process.env.IOS_SIMULATOR_URL = `http://localhost:${PORT}/api`;
      process.env.LOCAL_NETWORK_URL = `http://${localIp}:${PORT}/api`;

      console.log("\nEnvironment Variables for API access:");
      console.log(`API_URL: ${process.env.API_URL}`);
      console.log(`ANDROID_EMULATOR_URL: ${process.env.ANDROID_EMULATOR_URL}`);
      console.log(`IOS_SIMULATOR_URL: ${process.env.IOS_SIMULATOR_URL}`);
      console.log(`LOCAL_NETWORK_URL: ${process.env.LOCAL_NETWORK_URL}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
