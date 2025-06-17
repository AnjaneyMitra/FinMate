# GEMINI API Setup Instructions

## Getting a GEMINI API Key

1. **Visit Google AI Studio**: Go to https://aistudio.google.com/
2. **Sign in**: Use your Google account to sign in
3. **Create API Key**: 
   - Click on "Get API key" in the left sidebar
   - Click "Create API key"
   - Choose "Create API key in new project" or select an existing project
   - Copy the generated API key

## Environment Setup

1. **Backend Configuration**:
   ```bash
   cd /Applications/Vscode/FinMate/backend
   ```

2. **Update .env file**:
   Replace `your_gemini_api_key_here` in the `.env` file with your actual API key:
   ```
   GEMINI_API_KEY=AIza...your_actual_key_here
   ```

3. **Restart the backend server**:
   ```bash
   python main.py
   ```

## Testing the Integration

1. **Frontend**: Navigate to the Investment Learning Path page
2. **Setup Profile**: Click "Setup Profile" to create your learning profile
3. **Generate Content**: Click on any topic with the "Learn" button to generate personalized content
4. **Verify**: Look for the "Personalized for you" badge on generated content

## Troubleshooting

- **API Key Issues**: Make sure your API key is valid and has the proper permissions
- **Rate Limits**: The free tier has usage limits. Monitor your usage in Google AI Studio
- **Fallback Content**: If GEMINI is unavailable, the system will show general content instead

## Features

- ✅ Personalized content generation based on user profile
- ✅ Fallback to general content if API is unavailable
- ✅ Progress tracking and completion marking
- ✅ Topic-based learning with interactive UI
- ✅ Real-time content generation with loading states
