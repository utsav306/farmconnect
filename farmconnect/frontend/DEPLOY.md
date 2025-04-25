# Deploying the FarmConnect Frontend

This guide will walk you through the process of building and deploying the FarmConnect frontend app.

## Prerequisites

1. [Node.js](https://nodejs.org/) (version 16 or later)
2. [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
3. [EAS CLI](https://docs.expo.dev/build/setup/) (`npm install -g eas-cli`)
4. An [Expo](https://expo.dev/) account

## Setting Up for Deployment

1. Make sure you have the latest dependencies:

   ```
   npm install
   ```

2. Log in to your Expo account:

   ```
   npx eas login
   ```

3. Configure your app by updating `app.json` with your specific details (optional).

## Building the App

### For Android

1. Create a build for Android:

   ```
   npx eas build --platform android
   ```

2. Follow the prompts to set up credentials (or let EAS handle it).

### For iOS

1. Create a build for iOS:

   ```
   npx eas build --platform ios
   ```

2. Follow the prompts to set up credentials (requires an Apple Developer account).

### For Web

1. Create a web build:

   ```
   npm run build:web
   ```

2. The output will be in the `web-build` directory, which you can deploy to any static hosting service.

## Deploying to Expo

Once your build is complete, you can submit it to the app stores or share it via Expo:

1. To submit to app stores:

   ```
   npx eas submit --platform android
   npx eas submit --platform ios
   ```

2. To share via Expo:
   ```
   npx eas update
   ```

## Deploying the Web Version

The web version can be deployed to various platforms:

### Vercel

1. Install the Vercel CLI:

   ```
   npm install -g vercel
   ```

2. Deploy:
   ```
   vercel
   ```

### Netlify

1. Install the Netlify CLI:

   ```
   npm install -g netlify-cli
   ```

2. Deploy:
   ```
   netlify deploy
   ```

### GitHub Pages

1. Add a `homepage` field to your `package.json`:

   ```json
   "homepage": "https://yourusername.github.io/farmconnect"
   ```

2. Install gh-pages:

   ```
   npm install --save-dev gh-pages
   ```

3. Add deploy scripts to `package.json`:

   ```json
   "scripts": {
     "predeploy": "npm run build:web",
     "deploy": "gh-pages -d web-build"
   }
   ```

4. Deploy:
   ```
   npm run deploy
   ```

## Updating the API URL

Before deploying, ensure that your backend API URL is correctly set in `constants/config.js`. The current configuration points to:

```javascript
export const HOSTED_BACKEND_URL = "https://farmconnect-r602.onrender.com";
```

## Troubleshooting

- If you encounter build errors, check if all TypeScript types are properly defined.
- For eas-cli issues, try running `npx eas-cli doctor` to diagnose problems.
- For Expo-specific questions, consult the [Expo documentation](https://docs.expo.dev/).
