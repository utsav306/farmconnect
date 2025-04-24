const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} = require("@google/genai");

// Initialize Google Gemini API
const ai = new GoogleGenAI({
  apiKey:
    process.env.GEMINI_API_KEY || "AIzaSyA_z2eNUPGfQsy-nZg9GdkrgzYzncTWvMI",
});

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../public/uploads");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Initialize upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // Increased to 20MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Initialize upload middleware with error handling
const fileUpload = (req, res, next) => {
  const uploader = upload.single("image");

  uploader(req, res, (err) => {
    if (err) {
      console.error("File upload error:", err);

      // Handle specific multer errors
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            success: false,
            message: "Image file size too large. Maximum allowed size is 20MB.",
          });
        }
      }

      // Handle other errors
      return res.status(400).json({
        success: false,
        message: err.message || "Error uploading file",
      });
    }

    // File upload successful, proceed to next middleware
    next();
  });
};

// Helper function to analyze image with Gemini AI
async function analyzeImageWithGemini(imagePath, prompt) {
  try {
    console.log("Analyzing image with Gemini:", imagePath);
    console.log("Using prompt:", prompt);

    // Upload the file to Gemini
    const myfile = await ai.files.upload({
      file: imagePath,
      config: { mimeType: "image/jpeg" },
    });

    // Generate content using the uploaded file
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: createUserContent([
        createPartFromUri(myfile.uri, myfile.mimeType),
        prompt,
      ]),
    });

    console.log("Gemini response:", response.text);
    return response.text;
  } catch (error) {
    console.error("Error with Gemini API:", error);
    throw error;
  }
}

// Route for crop disease detection
router.post("/crop-disease-detection", fileUpload, async (req, res) => {
  try {
    // Log the data received
    console.log("Crop disease detection request received:");
    console.log("File:", req.file);
    console.log("Body:", req.body);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Define the prompt for disease detection
    const prompt =
      "Analyze this crop image and identify any diseases. If disease is detected, provide: 1) Disease name, 2) Confidence level (as a decimal between 0-1), 3) Brief description, and 4) Treatment recommendations. If no disease is detected, indicate it's a healthy plant. Format response as JSON with keys: disease, confidence, description, treatment.";

    try {
      // Call Gemini API
      const analysis = await analyzeImageWithGemini(req.file.path, prompt);

      // Try to parse the response as JSON
      let result;
      try {
        // Extract JSON from the text response
        const jsonMatch = analysis.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback to structured parsing if JSON not found
          result = {
            disease: analysis.includes("Healthy Plant")
              ? "Healthy Plant"
              : "Unknown Disease",
            confidence: 0.7,
            description: analysis,
            treatment: analysis.includes("Treatment")
              ? analysis.split("Treatment:")[1]?.trim()
              : "Consult an agricultural expert for proper diagnosis.",
          };
        }
      } catch (parseError) {
        console.error("Error parsing Gemini response:", parseError);
        // Create a structured result from the text response
        result = {
          disease: analysis.includes("Healthy Plant")
            ? "Healthy Plant"
            : "Unknown Disease",
          confidence: 0.7,
          description: analysis,
          treatment: analysis.includes("Treatment")
            ? analysis.split("Treatment:")[1]?.trim()
            : "Consult an agricultural expert for proper diagnosis.",
        };
      }

      return res.status(200).json({
        success: true,
        message: "Image analyzed with Gemini AI",
        result,
        file: {
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size,
        },
      });
    } catch (aiError) {
      console.error("AI analysis error:", aiError);

      // Fall back to mock data
      return res.status(200).json({
        success: true,
        message:
          "Image received for crop disease detection (AI service unavailable, using mock data)",
        result: {
          disease: "Tomato Late Blight",
          confidence: 0.92,
          description:
            "Late blight is a disease that affects tomatoes and potatoes, caused by the fungus-like organism Phytophthora infestans.",
          treatment:
            "Apply copper-based fungicides, ensure proper plant spacing for airflow, and remove infected plant parts immediately.",
        },
        file: {
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size,
        },
      });
    }
  } catch (error) {
    console.error("Error in crop disease detection:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing image",
      error: error.message,
    });
  }
});

// Route for price forecasting
// router.post("/price-forecast", fileUpload, async (req, res) => {
//   try {
//     // Log the data received
//     console.log("Price forecasting request received:");
//     console.log("File:", req.file);
//     console.log("Body:", req.body);

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "No image file provided",
//       });
//     }

//     // Define the prompt for crop identification and price forecasting
//     const prompt =
//       "Identify the crop in this image.Respond with only the crop name in lowercase (e.g., 'tomato').";

//     try {
//       // Call Gemini API for crop identification
//       const cropIdentification = await analyzeImageWithGemini(
//         req.file.path,
//         prompt,
//       );

//       // Extract crop name from response
//       const cropName = cropIdentification.trim().toLowerCase();
//       const validCrops = ["tomato", "potato", "onion", "rice", "wheat"];

//       // Validate that the response is a valid crop
//       const recognizedCrop = validCrops.includes(cropName)
//         ? cropName
//         : validCrops[Math.floor(Math.random() * validCrops.length)];

//       // Generate random forecasting data for demonstration
//       // In a real implementation, this would use historical data and ML models
//       const basePrice =
//         {
//           tomato: 45,
//           potato: 25,
//           onion: 35,
//           rice: 60,
//           wheat: 30,
//         }[recognizedCrop] || 40;

//       // Generate price data with some randomness and trend
//       const trendFactor = Math.random() > 0.5 ? 0.05 : -0.03;
//       const priceData = [];
//       let currentPrice = basePrice;

//       for (let i = 0; i < 14; i++) {
//         const fluctuation = Math.random() * 0.16 - 0.08;
//         currentPrice = currentPrice * (1 + trendFactor + fluctuation);
//         currentPrice = Math.max(currentPrice, basePrice * 0.7);
//         priceData.push(currentPrice.toFixed(2));
//       }

//       // Calculate statistics
//       const prices = priceData.map((p) => parseFloat(p));
//       const avgPrice = (
//         prices.reduce((a, b) => a + b, 0) / prices.length
//       ).toFixed(2);
//       const minPrice = Math.min(...prices).toFixed(2);
//       const maxPrice = Math.max(...prices).toFixed(2);
//       const priceChange = (
//         ((prices[prices.length - 1] - prices[0]) / prices[0]) *
//         100
//       ).toFixed(2);

//       return res.status(200).json({
//         success: true,
//         message: "Image analyzed with Gemini AI",
//         result: {
//           recognizedCrop,
//           cropName:
//             recognizedCrop.charAt(0).toUpperCase() + recognizedCrop.slice(1),
//           forecast: {
//             avgPrice,
//             minPrice,
//             maxPrice,
//             priceChange,
//             priceData,
//           },
//         },
//         file: {
//           filename: req.file.filename,
//           path: req.file.path,
//           size: req.file.size,
//         },
//       });
//     } catch (aiError) {
//       console.error("AI analysis error:", aiError);

//       // Fall back to mock data
//       const crops = ["tomato", "potato", "onion", "rice", "wheat"];
//       const recognizedCrop = crops[Math.floor(Math.random() * crops.length)];

//       return res.status(200).json({
//         success: true,
//         message:
//           "Image received for price forecasting (AI service unavailable, using mock data)",
//         result: {
//           recognizedCrop,
//           cropName:
//             recognizedCrop.charAt(0).toUpperCase() + recognizedCrop.slice(1),
//           forecast: {
//             avgPrice: (Math.random() * 50 + 20).toFixed(2),
//             minPrice: (Math.random() * 30 + 10).toFixed(2),
//             maxPrice: (Math.random() * 70 + 30).toFixed(2),
//             priceChange: (Math.random() * 20 - 10).toFixed(2),
//             priceData: Array.from({ length: 14 }, () =>
//               (Math.random() * 50 + 20).toFixed(2),
//             ),
//           },
//         },
//         file: {
//           filename: req.file.filename,
//           path: req.file.path,
//           size: req.file.size,
//         },
//       });
//     }
//   } catch (error) {
//     console.error("Error in price forecasting:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error processing image",
//       error: error.message,
//     });
//   }
// });
router.post("/price-forecast", fileUpload, async (req, res) => {
  try {
    // Log the data received
    console.log("Price forecasting request received:");
    console.log("File:", req.file);
    console.log("Body:", req.body);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Define the prompt for crop identification and price forecasting
    const prompt =
      "Identify the crop in this image. Respond with the crop name in lowercase (e.g., 'tomato'). If you are uncertain, provide your best guess. Do not include any other text in your response.";

    try {
      // Call Gemini API for crop identification
      const cropIdentification = await analyzeImageWithGemini(
        req.file.path,
        prompt,
      );

      // Extract crop name from response and convert to lowercase
      const recognizedCrop = cropIdentification.trim().toLowerCase();

      // Placeholder for price forecasting logic
      // In a real application, this is where you would integrate with a real-time
      // price forecasting service or model.  This would likely involve:
      // 1.  Sending the crop name to a price forecasting API.
      // 2.  Fetching historical price data from a database.
      // 3.  Using a machine learning model (trained on historical data, weather
      //     patterns, market trends, etc.) to predict future prices.
      // 4.  Considering factors like location (if available from req.body or other sources).

      // For this example, we'll use a simplified, random data generation:
      const basePrice = Math.random() * 80 + 20; // Assume a base price between 20 and 100
      const trendFactor = Math.random() > 0.5 ? 0.05 : -0.03;
      const priceData = [];
      let currentPrice = basePrice;

      for (let i = 0; i < 14; i++) {
        const fluctuation = Math.random() * 0.16 - 0.08;
        currentPrice = currentPrice * (1 + trendFactor + fluctuation);
        currentPrice = Math.max(currentPrice, basePrice * 0.7); // Ensure price doesn't drop too low
        priceData.push(currentPrice.toFixed(2));
      }

      // Calculate statistics
      const prices = priceData.map((p) => parseFloat(p));
      const avgPrice = (
        prices.reduce((a, b) => a + b, 0) / prices.length
      ).toFixed(2);
      const minPrice = Math.min(...prices).toFixed(2);
      const maxPrice = Math.max(...prices).toFixed(2);
      const priceChange = (
        ((prices[prices.length - 1] - prices[0]) / prices[0]) *
        100
      ).toFixed(2);

      return res.status(200).json({
        success: true,
        message:
          "Image analyzed with Gemini AI (Real-time price forecasting would happen here)",
        result: {
          recognizedCrop,
          cropName:
            recognizedCrop.charAt(0).toUpperCase() + recognizedCrop.slice(1),
          forecast: {
            avgPrice,
            minPrice,
            maxPrice,
            priceChange,
            priceData,
          },
        },
        file: {
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size,
        },
      });
    } catch (aiError) {
      console.error("AI analysis error:", aiError);

      // Fallback mechanism.  This should ideally use a more robust fallback,
      // like a cached result, a default crop, or a simpler analysis.  For this
      // example, we'll just return an error.
      return res.status(500).json({
        success: false,
        message: "Error processing image with AI: " + aiError.message,
        error: aiError,
      });
    }
  } catch (error) {
    console.error("Error in price forecasting:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing image",
      error: error.message,
    });
  }
});

module.exports = router;
