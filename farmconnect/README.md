# FarmConnect

FarmConnect is a comprehensive platform connecting farmers with consumers, providing AI-powered tools to help farmers optimize their business.

## Features

### For Farmers

- **Dashboard**: Track sales, inventory, and orders in one place
- **Product Management**: Add, edit, and manage your products on the marketplace
- **Order Management**: Handle incoming orders and track fulfillment
- **AI-Powered Farming Tools**:
  - **Crop Disease Detection**: Upload images to identify plant diseases and get treatment recommendations
  - **Price Forecasting**: Upload crop images to get price trend forecasts
  - **Trending Crops Recommendations**: Get region-specific recommendations for trending crops with profit potential
  - **Diversification Options**: Receive personalized suggestions for profitable farming diversification

### For Consumers

- **Marketplace**: Browse and purchase fresh produce directly from farmers
- **Cart & Checkout**: Seamless shopping experience
- **Order History**: Track past orders and reorder easily
- **Farm Profiles**: Learn about the farmers behind your food

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **AI Integration**: Google Gemini AI API
- **Authentication**: JWT-based auth with role management

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB (local or cloud)
- Expo CLI (`npm install -g expo-cli`)

### Setup

1. Clone the repository
2. Set up the backend:
   ```bash
   cd backend
   npm install
   # Create .env file with required variables
   npm run dev
   ```
3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Environment Variables

### Backend

Create a `.env` file in the backend directory with:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/farmconnect
JWT_SECRET=your_jwt_secret_key
GEMINI_KEY=your_gemini_api_key
```

## API Documentation

See the `backend/API_DOCS.md` file for detailed API documentation.

## AI Features Implementation

### Crop Disease Detection

Upload crop images to get AI-powered disease detection with treatment recommendations.

### Price Forecasting

Upload crop images for identification and receive market price forecasts.

### Trending Crops Recommendations

Select your region to receive AI-generated recommendations for trending crops, including:

- Crop name and details
- Profit potential per acre
- Growing season information
- Water requirements

### Diversification Options

Input your current crops and region to get personalized recommendations for:

- Complementary farming activities
- Initial investment requirements
- Time to profitability
- Key benefits and considerations
