const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

async function fixOrderNumberIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;

    try {
      // Drop the unique index on orderNumber
      await db.collection("orders").dropIndex("orderNumber_1");
      console.log("Dropped orderNumber_1 index");
    } catch (error) {
      console.error("Error dropping index:", error.message);
      // Continue even if we couldn't drop the index
    }

    // Get all orders that don't have an orderNumber
    const orders = await db
      .collection("orders")
      .find({ orderNumber: { $exists: false } })
      .toArray();
    console.log(`Found ${orders.length} orders without orderNumber`);

    // Update each order with a unique orderNumber
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${i}`;

      await db
        .collection("orders")
        .updateOne({ _id: order._id }, { $set: { orderNumber: orderNumber } });

      console.log(`Updated order ${order._id} with orderNumber ${orderNumber}`);
    }

    // Recreate the unique index but allow sparse
    await db
      .collection("orders")
      .createIndex(
        { orderNumber: 1 },
        { background: true, unique: true, sparse: true },
      );
    console.log("Recreated orderNumber_1 index with sparse option");

    console.log("Orders fixed successfully!");
  } catch (error) {
    console.error("Error fixing orders:", error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the function
fixOrderNumberIndex();
