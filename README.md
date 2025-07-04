# FinMate - Modern Personal Finance Management

![FinMate Logo](https://img.shields.io/badge/FinMate-Personal%20Finance-teal?style=for-the-badge&logo=dollar-sign)

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green.svg)](https://fastapi.tiangolo.com/)
[![Firebase](https://img.shields.io/badge/Firebase-11.9.0-orange.svg)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.8-cyan.svg)](https://tailwindcss.com/)

> **Modern Finance, Made Simple** - Experience intelligent budgeting with AI-powered insights and a beautiful, minimal workspace designed for clarity and focus.

## 🚀 Overview

FinMate is a comprehensive personal finance management application that combines intelligent budgeting, AI-powered insights, and professional tax filing capabilities. Built with modern web technologies, it provides a seamless experience for managing your financial life.

### ✨ Key Features

- **🤖 AI-Powered Insights**: Intelligent spending analysis and personalized financial recommendations
- **💰 Smart Budgeting**: Visual budget tracking with category-based spending analysis
- **📊 Advanced Analytics**: Real-time spending trends, predictions, and comparisons
- **🎯 Goal Tracking**: Visual progress tracking with gamified milestones
- **📋 Tax Filing System**: Comprehensive tax preparation and filing with guided workflows
- **📱 Responsive Design**: Beautiful, modern UI that works on all devices
- **🔒 Secure**: Firebase authentication and secure data handling
- **📈 Investment Learning**: Structured learning paths for investment education

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19.1.0
- **Styling**: TailwindCSS 4.1.8
- **Charts**: Chart.js, Recharts, Nivo
- **State Management**: React Hooks
- **Routing**: React Router DOM
- **UI Components**: Lucide React icons
- **Markdown**: React Markdown with GFM support

### Backend
- **Framework**: FastAPI
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI/ML**: Google Gemini API, Scikit-learn
- **Data Processing**: Pandas, NumPy
- **Document Processing**: PDF processing for tax documents
- **Forecasting**: Prophet, Statsmodels

### Infrastructure
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting
- **File Storage**: Firebase Storage
- **Security**: JWT tokens, Firestore security rules

## 🏗️ Project Structure

```
FinMate/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS and theme files
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                 # FastAPI backend application
│   ├── main.py             # FastAPI application entry point
│   ├── models.py           # Database models
│   ├── tax_filing/         # Tax filing system
│   └── requirements.txt    # Backend dependencies
├── firebase.json           # Firebase configuration
├── firestore.rules        # Database security rules
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Firebase CLI** (for deployment)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/FinMate.git
   cd FinMate
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Backend Setup**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Copy environment variables
   cp .env.example .env
   # Edit .env with your configuration
   
   cd ..
   ```

5. **Firebase Configuration**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize Firebase (if not already configured)
   firebase init
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   uvicorn main:app --reload --port 8000
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```

3. **Access the Application**
   - Frontend: [http://localhost:3001](http://localhost:3001)
   - Backend API: [http://localhost:8000](http://localhost:8000)
   - API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

## 🎯 Core Features

### 💰 Financial Dashboard
- Real-time expense tracking and categorization
- Monthly spending analysis and trends
- Budget vs. actual spending comparisons
- Visual charts and graphs for better insights

### 📊 Smart Analytics
- **Spending Predictions**: AI-powered future expense forecasting
- **Category Analysis**: Detailed breakdown of spending patterns
- **Monthly Comparisons**: Track your progress month-over-month
- **Risk Assessment**: Financial risk profiling and recommendations

### 🎯 Goal Management
- Set and track financial goals
- Visual progress indicators
- Smart milestone tracking
- Achievement notifications

### 📋 Tax Filing System
- **Form Discovery**: Find the right tax forms for your situation
- **Document Management**: Upload and organize tax documents
- **Guided Filing**: Step-by-step tax return completion
- **OCR Processing**: Automatic data extraction from documents
- **Validation**: Real-time form validation and error checking

### 🤖 AI-Powered Features
- **Personalized Content**: AI-generated financial advice
- **Intelligent Categorization**: Automatic expense categorization
- **Learning Paths**: Structured investment education
- **Smart Recommendations**: Personalized financial insights

## 🔐 Security Features

- **Firebase Authentication**: Secure user authentication
- **Role-Based Access**: User-specific data access
- **Firestore Security Rules**: Database-level security
- **JWT Tokens**: Secure API authentication
- **Data Encryption**: Encrypted data storage

## 📱 User Interface

### Design Principles
- **Minimal & Clean**: Focused on clarity and usability
- **Responsive Design**: Works seamlessly on all devices
- **Theme Support**: Built-in theme system with consistent styling
- **Accessibility**: WCAG compliant design patterns

### Key UI Components
- **Interactive Charts**: Beautiful, animated financial visualizations
- **Modal Dialogs**: Professional confirmation dialogs
- **Bulk Operations**: Efficient multi-select functionality
- **Progressive Forms**: Step-by-step guided experiences

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test
```

### Backend Testing
```bash
cd backend
python -m pytest
```

## 🚀 Deployment

### Firebase Hosting
```bash
# Build frontend
cd frontend
npm run build

# Deploy to Firebase
firebase deploy
```

### Backend Deployment
```bash
# Deploy backend (configure your preferred hosting)
# Options: Google Cloud Run, AWS Lambda, Heroku, etc.
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

**Frontend**
```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
```

## 📊 API Documentation

The backend provides a comprehensive REST API documented with OpenAPI/Swagger:

- **Interactive Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Key API Endpoints

- `GET /health` - Health check endpoint
- `POST /transactions` - Add new transactions
- `GET /transactions` - Get user transactions
- `GET /analytics` - Get spending analytics
- `POST /tax-filing` - Tax filing operations
- `GET /ai-insights` - AI-powered insights

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **Firebase** for providing excellent backend services
- **React** team for the amazing frontend framework
- **FastAPI** for the high-performance backend framework
- **TailwindCSS** for the utility-first CSS framework
- **Chart.js** and **Nivo** for beautiful visualizations
- **Google Gemini** for AI-powered insights

## 📞 Support

For support, email support@finmate.com or join our community:

- **Documentation**: [docs.finmate.com](https://docs.finmate.com)
- **Discord**: [discord.gg/finmate](https://discord.gg/finmate)
- **GitHub Issues**: [github.com/finmate/issues](https://github.com/finmate/issues)

## 🗓️ Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Investment portfolio tracking
- [ ] Cryptocurrency support
- [ ] Advanced reporting features
- [ ] Multi-currency support
- [ ] Bank account integrations
- [ ] Financial advisor chat

### Recent Updates
- ✅ Enhanced transaction deletion with bulk operations
- ✅ Improved tax filing system with OCR
- ✅ AI-powered financial insights
- ✅ Advanced theme system
- ✅ Comprehensive analytics dashboard

---

**Built with ❤️ by the FinMate team**

*Modern Finance, Made Simple*
