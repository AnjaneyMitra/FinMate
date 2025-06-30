# FinMate

A comprehensive personal finance management application built with React frontend and FastAPI backend, featuring expense tracking, financial analysis, and tax filing assistance.

## Features

- **Expense Tracking**: Upload and analyze bank statements
- **Financial Analysis**: Interactive charts and spending insights
- **Tax Filing**: Form discovery and filing assistance
- **Firebase Integration**: Real-time data storage and synchronization
- **AI-Powered Insights**: Gemini AI integration for financial guidance

## Tech Stack

- **Frontend**: React with modern UI components
- **Backend**: FastAPI (Python)
- **Database**: Firebase Firestore
- **Charts**: Chart.js and Nivo
- **Styling**: Tailwind CSS

## Project Structure

```
FinMate/
├── frontend/          # React application
├── backend/           # FastAPI server
├── firebase.json      # Firebase configuration
├── firestore.rules    # Firestore security rules
└── package.json       # Root dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python 3.8+
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FinMate
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Setup Backend**
   ```bash
   cd backend
   pip install fastapi uvicorn
   uvicorn main:app --reload
   ```

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Configure authentication and security rules
4. Add your Firebase configuration to the frontend

## Usage

1. **Start the backend server** (runs on http://localhost:8000)
2. **Start the frontend application** (runs on http://localhost:3000)
3. **Upload bank statements** for expense analysis
4. **View financial insights** through interactive dashboards
5. **Access tax filing features** for form discovery and assistance

## API Endpoints

- `GET /health` - Health check endpoint
- Additional endpoints documented in backend/
b
## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
