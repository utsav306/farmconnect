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
  apiKey: process.env.GEMINI_KEY || "AIzaSyA_z2eNUPGfQsy-nZg9GdkrgzYzncTWvMI",
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

// Route for getting trending crop recommendations
router.post("/trending-crops", async (req, res) => {
  try {
    console.log("Trending crops recommendation request received");
    console.log("Body:", req.body);

    const { region } = req.body;

    if (!region) {
      return res.status(400).json({
        success: false,
        message: "Region is required for crop recommendations",
      });
    }

    // Define the prompt for trending crop recommendations
    const prompt = `As an agricultural expert, recommend 5 trending crops for the ${region} region of India. Consider current market demand, climate suitability, and profitability trends. For each crop, provide: 1) Crop name, 2) Why it's trending now, 3) Estimated profit potential (rupees per acre), 4) Suitable growing season, and 5) Water requirements. Format as a JSON array with objects containing: name, reason, profitPerAcre, season, and waterRequirement fields.`;

    try {
      // Call Gemini AI for text-based recommendations using the same pattern as image analysis
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      // Extract text from the response (handle different response structures)
      let text;
      if (
        response &&
        response.response &&
        typeof response.response.text === "function"
      ) {
        text = response.response.text();
      } else if (
        response &&
        response.text &&
        typeof response.text === "function"
      ) {
        text = response.text();
      } else if (response && response.text) {
        text = response.text;
      } else if (typeof response === "string") {
        text = response;
      } else {
        console.log("Response structure:", JSON.stringify(response, null, 2));
        throw new Error("Could not extract text from API response");
      }

      console.log("Gemini response:", text);

      // Extract JSON from the text response
      let recommendations;
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          recommendations = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not extract valid JSON from the response");
        }
      } catch (parseError) {
        console.error("Error parsing Gemini response:", parseError);
        throw parseError;
      }

      return res.status(200).json({
        success: true,
        message: "Trending crop recommendations generated",
        recommendations,
      });
    } catch (aiError) {
      console.error("AI recommendation error:", aiError);

      // Fall back to mock data
      return res.status(200).json({
        success: true,
        message: "Trending crop recommendations (using mock data)",
        recommendations: [
          {
            name: "Quinoa",
            reason:
              "High demand in health food markets with limited local supply",
            profitPerAcre: "₹1,20,000",
            season: "Winter (October-March)",
            waterRequirement: "Low to Moderate",
          },
          {
            name: "Dragon Fruit",
            reason: "Growing export market and high domestic prices",
            profitPerAcre: "₹3,00,000",
            season: "Year-round with peak production in summer",
            waterRequirement: "Low",
          },
          {
            name: "Medicinal Turmeric",
            reason: "Increasing demand for organic, high-curcumin varieties",
            profitPerAcre: "₹1,50,000",
            season: "Planting in April-May, harvesting in January-March",
            waterRequirement: "Moderate",
          },
          {
            name: "Baby Corn",
            reason: "Rising demand from restaurants and food processors",
            profitPerAcre: "₹90,000",
            season: "Year-round with 60-day growing cycle",
            waterRequirement: "Moderate to High",
          },
          {
            name: "Stevia",
            reason: "Growing market for natural sweeteners",
            profitPerAcre: "₹1,80,000",
            season: "Planting in February-March",
            waterRequirement: "Moderate",
          },
        ],
      });
    }
  } catch (error) {
    console.error("Error processing trending crops request:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating crop recommendations",
      error: error.message,
    });
  }
});

// Route for suggesting diversification options
router.post("/diversification-options", async (req, res) => {
  try {
    console.log("Diversification options request received");
    console.log("Body:", req.body);

    const { currentCrops, region, farmSize } = req.body;

    if (!currentCrops || !region) {
      return res.status(400).json({
        success: false,
        message:
          "Current crops and region are required for diversification suggestions",
      });
    }

    // Define the prompt for diversification suggestions
    const prompt = `As an agricultural expert, suggest 4 profitable diversification options for a farmer in the ${region} region who currently grows ${currentCrops}${
      farmSize ? ` on ${farmSize} acres of land` : ""
    }. For each suggestion, provide: 1) Option name (crop or farming technique), 2) Why it complements their existing crops, 3) Estimated initial investment (in rupees), 4) Estimated time to profitability, and 5) Key benefits (economic and agricultural). Format as JSON array with objects containing: option, complementaryReason, initialInvestment, timeToProfit, and benefits fields. Each field should be a simple string, not a nested object.`;

    try {
      // Call Gemini AI for text-based recommendations using the same pattern as image analysis
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      // Extract text from the response (handle different response structures)
      let text;
      if (
        response &&
        response.response &&
        typeof response.response.text === "function"
      ) {
        text = response.response.text();
      } else if (
        response &&
        response.text &&
        typeof response.text === "function"
      ) {
        text = response.text();
      } else if (response && response.text) {
        text = response.text;
      } else if (typeof response === "string") {
        text = response;
      } else {
        console.log("Response structure:", JSON.stringify(response, null, 2));
        throw new Error("Could not extract text from API response");
      }

      console.log("Gemini response:", text);

      // Extract JSON from the text response
      let suggestions;
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);

          // Process suggestions to ensure all fields are strings
          suggestions = suggestions.map((suggestion) => {
            // Convert benefits to string if it's an object
            if (
              suggestion.benefits &&
              typeof suggestion.benefits === "object"
            ) {
              suggestion.benefits = Object.entries(suggestion.benefits)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ");
            }
            return suggestion;
          });
        } else {
          throw new Error("Could not extract valid JSON from the response");
        }
      } catch (parseError) {
        console.error("Error parsing Gemini response:", parseError);
        throw parseError;
      }

      return res.status(200).json({
        success: true,
        message: "Diversification suggestions generated",
        suggestions,
      });
    } catch (aiError) {
      console.error("AI suggestion error:", aiError);

      // Fall back to mock data
      return res.status(200).json({
        success: true,
        message: "Diversification suggestions (using mock data)",
        suggestions: [
          {
            option: "Integrated Fish Farming",
            complementaryReason:
              "Uses existing water resources while providing additional income stream",
            initialInvestment: "₹50,000 - ₹1,00,000",
            timeToProfit: "6-8 months",
            benefits:
              "Efficient water usage, fish waste serves as crop fertilizer, 40-60% increase in farm income",
          },
          {
            option: "Apiculture (Beekeeping)",
            complementaryReason:
              "Bees pollinate existing crops while producing valuable honey",
            initialInvestment: "₹25,000 - ₹50,000",
            timeToProfit: "3-6 months",
            benefits:
              "Increased crop yields through pollination, honey production, low maintenance requirement",
          },
          {
            option: "Aromatic Plants (Lemongrass)",
            complementaryReason:
              "Can be grown on borders or marginal land without affecting main crops",
            initialInvestment: "₹15,000 - ₹30,000",
            timeToProfit: "4-6 months",
            benefits:
              "High-value essential oil market, natural pest repellent, drought resistant",
          },
          {
            option: "Mushroom Cultivation",
            complementaryReason:
              "Utilizes crop residue and can be grown in unused structures",
            initialInvestment: "₹20,000 - ₹40,000",
            timeToProfit: "1-2 months",
            benefits:
              "Year-round income, high return on investment, uses agricultural waste products",
          },
        ],
      });
    }
  } catch (error) {
    console.error("Error processing diversification request:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating diversification suggestions",
      error: error.message,
    });
  }
});

module.exports = router;
