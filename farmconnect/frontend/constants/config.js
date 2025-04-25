// Configuration settings for the application

// Set the hosted backend URL
export const HOSTED_BACKEND_URL = "https://farmconnect-r602.onrender.com";

// Backend API URL using the hosted backend
export const API_URL = `${HOSTED_BACKEND_URL}/api`;

// Export other configuration settings as needed
export const APP_CONFIG = {
  apiUrl: API_URL,
  apiTimeout: 10000, // 10 seconds
  defaultLanguage: "en",
};

// For debugging
console.log("Using API URL:", API_URL);
