// Configuration settings for the application
// Update the IP_ADDRESS whenever your network changes

// Set the IP address of your backend server here
export const IP_ADDRESS = "192.168.0.167"; // Change this when your IP changes

// Backend API URL constructed using the IP address
export const API_URL = `http://${IP_ADDRESS}:5000/api`;

// Export other configuration settings as needed
export const APP_CONFIG = {
  apiUrl: API_URL,
  apiTimeout: 10000, // 10 secondsc
  defaultLanguage: "en",
};

// For debugging
console.log("Using API URL:", API_URL);
