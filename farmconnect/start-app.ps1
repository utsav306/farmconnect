# PowerShell script to start the FarmConnect application

Write-Host "Starting FarmConnect Application..." -ForegroundColor Green

# First, update the IP address in the config file
Write-Host "Updating IP address in the config file..." -ForegroundColor Cyan
Set-Location -Path .\frontend
npm run update-ip
Set-Location -Path ..

# Start the backend server
Write-Host "Starting the backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '.\backend'; npm run dev"

# Wait a moment for the backend to initialize
Start-Sleep -Seconds 3

# Start the frontend application
Write-Host "Starting the frontend application..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '.\frontend'; npm start"

Write-Host "FarmConnect application is now running!" -ForegroundColor Green
Write-Host "- Backend is running in its own PowerShell window" -ForegroundColor Yellow
Write-Host "- Frontend is running in its own PowerShell window" -ForegroundColor Yellow
Write-Host "To stop the application, close both PowerShell windows." -ForegroundColor Yellow 