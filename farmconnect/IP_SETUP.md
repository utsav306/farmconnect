# IP Address Configuration System

This system provides a centralized way to manage the backend API URL in the FarmConnect application. When your IP address changes, you only need to update it in one place.

## How It Works

1. The system uses a central configuration file at `frontend/constants/config.js` with the IP address and API URL.
2. All components and services in the app reference this configuration file for API calls.
3. An automatic utility script can detect your current IP address and update the configuration.

## When Your IP Changes

When your IP address changes, you have three options:

### Option 1: Use the PowerShell Script (Recommended)

Run the PowerShell script to start both the frontend and backend with the correct IP address:

```
./start-app.ps1
```

This script:

- Automatically detects your current IP address
- Updates the configuration file
- Starts both the backend and frontend in separate windows

### Option 2: Use the Update IP Script

If you only need to update the IP address:

```
cd frontend
npm run update-ip
```

This automatically detects your IP address and updates the configuration file.

### Option 3: Manual Update

If the automatic detection doesn't work correctly:

1. Open `frontend/constants/config.js`
2. Find the line: `export const IP_ADDRESS = "192.168.x.x";`
3. Replace the IP address with your current one
4. Save the file

## Troubleshooting

If you're experiencing connection issues:

1. Check your current IP address:

   - Windows: Run `ipconfig` in Command Prompt
   - Mac/Linux: Run `ifconfig` or `ip addr` in Terminal

2. Make sure your device is connected to the same network as the backend server

3. Verify the backend server is running:

   ```
   cd backend
   npm run dev
   ```

4. Check the console logs for the actual API URL being used
