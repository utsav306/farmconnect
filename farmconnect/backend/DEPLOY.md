# Deploying FarmConnect Backend to Render

This guide will walk you through the process of deploying the FarmConnect backend to Render.com.

## Prerequisites

1. Create a [Render.com](https://render.com) account if you don't have one already
2. Set up a MongoDB Atlas account and create a cluster for your production database
3. Have your GitHub repository ready with the backend code

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up or log in
2. Create a new project (if needed)
3. Build a new cluster (the free tier is sufficient for starting)
4. In the Security section, create a database user with a secure password
5. In Network Access, add your IP address or allow access from anywhere (0.0.0.0/0) for development
6. Once your cluster is created, click "Connect" and select "Connect your application"
7. Copy the connection string - it will look something like:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/farmconnect
   ```
8. Replace `<username>` and `<password>` with your database username and password

## Step 2: Deploy to Render

### Option 1: Using the Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com/) and sign in
2. Click "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure your service:
   - **Name**: `farmconnect-api` (or any name you prefer)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
5. Under "Advanced" settings, add the following environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render will use this internally)
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string for JWT token generation
   - `JWT_EXPIRES_IN`: `7d`
   - `GEMINI_API_KEY`: Your Gemini API key (if you're using this feature)
6. Click "Create Web Service"

### Option 2: Using render.yaml (Blueprint)

1. The render.yaml file is already included in the backend directory
2. Go to [Render Dashboard](https://dashboard.render.com/) and sign in
3. Click "Blueprint" from the sidebar
4. Connect your GitHub repository
5. Render will detect the render.yaml file and suggest the services to deploy
6. You'll need to manually set the secret environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
7. Click "Apply" to deploy the service

## Step 3: Verify Deployment

1. Once the deployment is complete, Render will provide you with a URL for your service
2. Visit `https://your-app-url.onrender.com/health` to verify that the service is running
3. You should see a response like: `{"status":"OK","message":"Server is running"}`

## Step 4: Update Environment Variables in Frontend

If you have a frontend application that connects to this backend, update its environment variables to use the new API URL:

```
API_URL=https://your-app-url.onrender.com/api
```

## Troubleshooting

- **Connection Issues**: Make sure your MongoDB Atlas IP whitelist includes 0.0.0.0/0 or the Render IP addresses
- **Build Failures**: Check the build logs in Render for any errors
- **Runtime Errors**: Check the logs in Render to see any application errors after deployment

## Maintenance

- **Scaling**: In the Render dashboard, you can scale your service as needed
- **Logs**: You can view application logs in the Render dashboard
- **Updates**: Any new commits to your GitHub repository's main branch will automatically trigger a new deployment if you've configured auto-deploy
