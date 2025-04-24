const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

async function showCollectionSchema() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get the database
    const db = mongoose.connection.db;

    // Get all collections
    const collections = await db.listCollections().toArray();

    // Loop through all collections
    for (const collection of collections) {
      console.log(`\nCollection name: ${collection.name}`);

      // Get the collection info including validation rules
      const collInfo = await db.command({
        listCollections: 1,
        filter: { name: collection.name },
      });

      if (
        collInfo.cursor &&
        collInfo.cursor.firstBatch &&
        collInfo.cursor.firstBatch.length > 0
      ) {
        const coll = collInfo.cursor.firstBatch[0];
        console.log("Options:", JSON.stringify(coll.options, null, 2));

        // Get indexes for the collection
        const indexes = await db.collection(collection.name).indexes();
        console.log("Indexes:", JSON.stringify(indexes, null, 2));

        // Get a sample document to infer schema
        const sampleDocs = await db
          .collection(collection.name)
          .find()
          .limit(1)
          .toArray();
        if (sampleDocs.length > 0) {
          console.log("Sample document keys:", Object.keys(sampleDocs[0]));
        } else {
          console.log("No documents in collection");
        }
      }
    }
  } catch (error) {
    console.error("Error examining database:", error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

// Run the function
showCollectionSchema();
