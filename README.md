# Photo Management Application

A web application that allows users to upload photos and find similar photos using image matching technology.

## Features

- User authentication (sign up/sign in)
- Photo upload functionality
- Find similar photos using structural similarity index (SSIM)
- Download selected photos as a zip file
- Modern and responsive UI using Material-UI

## Prerequisites

- Python 3.7+
- Node.js 14+
- npm or yarn

## Setup

### Backend Setup

1. Create a virtual environment and activate it:
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (use this command):
venv\Scripts\activate
# On macOS/Linux (use this command):
source venv/bin/activate
```

**Note for Windows PowerShell users**: If you get a script execution error, you need to set the execution policy. Run PowerShell as Administrator and execute:
```powershell
# Temporary solution (for current PowerShell session only):
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# OR Permanent solution (for your user account):
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the Flask backend:
```bash
python app.py
```

The backend will run on http://localhost:5000

### Frontend Setup

**Note for Windows PowerShell users**: If you get a script execution error when running npm commands, you need to set the execution policy as described above.

1. Set up the React application:
```powershell
# Create a new React app in a temporary directory
npx create-react-app temp-app

# Copy all necessary files from temp-app
Copy-Item -Path "temp-app\node_modules" -Destination "." -Recurse -Force
Copy-Item -Path "temp-app\package.json" -Destination "." -Force
Copy-Item -Path "temp-app\public" -Destination "." -Recurse -Force
Copy-Item -Path "temp-app\src" -Destination "." -Recurse -Force

# Remove the temporary app
Remove-Item -Recurse -Force temp-app

# Install additional dependencies with specific versions
npm install @emotion/react@11.10.5 @emotion/styled@11.10.5 @mui/material@5.11.11 @mui/icons-material@5.11.11 axios@1.3.4 react-router-dom@6.8.2 --legacy-peer-deps
```

2. Start the React development server:
```bash
npm start
```

The frontend will run on http://localhost:3000

## Usage

1. Register a new account or sign in with existing credentials
2. On the dashboard, you can:
   - Upload new photos using the "Upload Photo" button
   - Find similar photos by clicking "Find Similar Photos" and uploading a sample photo
   - View matched photos and select/deselect them
   - Download selected photos as a zip file

## Technical Details

- Backend: Flask (Python)
- Frontend: React with Material-UI
- Image Processing: Pillow, scikit-image
- Authentication: JWT (JSON Web Tokens)
- Image Matching: Structural Similarity Index (SSIM)

## Security Notes

- The application uses JWT for authentication
- Passwords are hashed using Werkzeug's security functions
- File uploads are secured using secure_filename
- CORS is enabled for development (should be configured properly for production)

## Performance Considerations

- Images are resized to 100x100 pixels for similarity comparison
- The backend processes images efficiently using numpy and scikit-image
- Large files are handled using streaming responses
- The frontend implements lazy loading for image display