#!/usr/bin/env node

/**
 * Simple script to generate a secure random string for JWT_SECRET
 * Run with: node scripts/generate-jwt-secret.js
 */

const crypto = require("crypto");

// Generate a secure random string of 64 bytes and convert to base64
const jwtSecret = crypto.randomBytes(64).toString("base64");

console.log("Generated JWT_SECRET for production:");
console.log(jwtSecret);
console.log(
  "\nAdd this to your environment variables on Render or your deployment platform.",
);
