/**
 * Script to update the IP address in the config file
 * Run with: node scripts/update-ip.js
 */

const fs = require("fs");
const { networkInterfaces } = require("os");
const path = require("path");

// Function to get the local IP address
function getLocalIpAddress() {
  const nets = networkInterfaces();
  const results = {};

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (loopback) addresses
      if (net.family === "IPv4" && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  // Try to find a suitable interface
  // First check for Wi-Fi (common names on different platforms)
  const wifiInterfaces = ["Wi-Fi", "WiFi", "wlan0", "wlp2s0", "en0"];
  for (const interfaceName of wifiInterfaces) {
    if (results[interfaceName] && results[interfaceName].length > 0) {
      return results[interfaceName][0];
    }
  }

  // Then check for Ethernet
  const ethernetInterfaces = ["Ethernet", "eth0", "en1"];
  for (const interfaceName of ethernetInterfaces) {
    if (results[interfaceName] && results[interfaceName].length > 0) {
      return results[interfaceName][0];
    }
  }

  // If no specific interface is found, return the first available IP
  for (const addresses of Object.values(results)) {
    if (addresses && addresses.length > 0) {
      return addresses[0];
    }
  }

  // Fallback
  return "127.0.0.1";
}

// Path to the config file
const configPath = path.join(__dirname, "..", "constants", "config.js");

// Get the current IP address
const currentIp = getLocalIpAddress();
console.log(`Detected local IP address: ${currentIp}`);

// Read the current config file
let configContent;
try {
  configContent = fs.readFileSync(configPath, "utf8");
  console.log("Successfully read the current config file");
} catch (error) {
  console.error("Error reading config file:", error.message);
  process.exit(1);
}

// Update the IP_ADDRESS in the config
const updatedContent = configContent.replace(
  /export const IP_ADDRESS = ".*?"/,
  `export const IP_ADDRESS = "${currentIp}"`,
);

// Write the updated config back to the file
try {
  fs.writeFileSync(configPath, updatedContent, "utf8");
  console.log(`Config file updated with IP: ${currentIp}`);
} catch (error) {
  console.error("Error writing config file:", error.message);
  process.exit(1);
}

console.log("Done!");
