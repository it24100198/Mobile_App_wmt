=================================================
Denim - Garment  MANAGEMENT SYSTEM  — Mobile App
=================================================

01. GitHub Repository Link
----------------------------------------
GitHub Repository: []


02. Team Details 
----------------------------------------
Group Number: WE_IT_02
Member 1: IT24100198 – Pavinthan.V – Employee Management & Expense Management
Member 2: IT24100891 – Meththasinghe M.D.D.T – Production Order 
Tracking System
Member 3: IT24101974 – Rajapaksha D.M.A.N. – Manufacturing 
Management 
Member 4: IT24100480 – Jeeveith T.R. – Product & Stock 
Management 
Member 5: IT24102097 –Safran S.M. – Purchase 
Management 
Member 6: IT24100824 – Gunasena P.G.P. – Sales & POS 
System 


03. Deployment Details
----------------------------------------
Backend URL: []



# Denim Garment Management System — Mobile App

> **Note:** This module is part of the **IT24100480 - ITP_IT_118** group project. The mobile app provides on-the-go access to product and stock management features for the Denim Garment Management System.

## 1. Project Summary

The Denim Garment Management System Mobile App is a React Native-based application designed to enable field workers, supervisors, and managers in denim manufacturing to access and manage product catalogs, stock levels, transactions, and material issuances directly from mobile devices. It integrates seamlessly with the backend REST API and AI service to provide real-time data, predictions, and alerts, ensuring efficient operations even in remote or production floor environments.

## 2. Core Features

- **Product Management**: View, search, and update product details, including categories, stock levels, and barcodes.
- **Stock Monitoring**: Real-time stock tracking with barcode scanning for quick inventory checks and updates.
- **Transaction Logging**: Record stock in/out transactions with timestamps and user details.
- **Material Issuances**: Log materials issued to production lines, linked to specific jobs or orders.
- **AI Integration**: Receive predictions for wastage, efficiency, suggestions, and alerts from the AI service.
- **Offline Support**: Basic offline viewing of cached data with sync capabilities when online.
- **User Authentication**: Secure login with role-based access (e.g., supervisor, worker).
- **Barcode Scanning**: Integrated camera-based barcode reader for quick product identification.

## 3. Tech Stack

- **React Native 0.72+**: Cross-platform mobile framework for iOS and Android.
- **Expo**: Development platform for easier React Native builds and deployments.
- **Axios**: HTTP client for API communications.
- **AsyncStorage**: Local storage for caching data and user sessions.
- **React Navigation**: Navigation library for screen transitions.
- **React Native Camera**: For barcode scanning functionality.
- **Jest & React Native Testing Library**: For unit and integration testing.

## 4. Folder Structure
mobile/
├── App.js                    # Main app entry point
├── app.json                  # Expo configuration
├── index.js                  # App registry
├── package.json              # Dependencies and scripts
├── assets/                   # Static assets (images, fonts)
└── src/
    ├── api/                  # API service functions (axios configs)
    ├── components/           # Reusable UI components (buttons, modals, scanners)
    ├── context/              # React context for global state (auth, data)
    ├── navigation/           # Navigation configurations (stacks, tabs)
    ├── screens/              # Screen components (Dashboard, Products, Stock, etc.)
    ├── theme/                # Theme constants (colors, fonts, styles)
    └── utils/                # Helper functions (formatters, validators)


    The repository is structured into three main applications: the `frontend`, the `backend`, and the `ai-service` (AI microservice).

-----
.
├── backend/                       # Express backend application
│   ├── config/                    # Database and environment configurations
│   ├── controllers/               # Route controllers (Products, Transactions, Issuances)
│   ├── middleware/                # Custom express middleware (Error Handlers)
│   ├── models/                    # Mongoose schemas (Product, Transaction, IssuanceRecord)
│   ├── routes/                    # Express routing logic
│   ├── app.js                     # Express application setup
│   ├── index.js                   # Main backend server entry point
│   └── package.json               # Backend dependencies
└── frontend/                      # React Vite frontend application
    ├── public/                    # Static public assets
   ```text
   .
   ├── backend/                       # Express backend application
   │   ├── config/                    # Database and environment configurations
   │   ├── controllers/               # Route controllers (Products, Transactions, Issuances)
   │   ├── middleware/                # Custom express middleware (Error Handlers)
   │   ├── models/                    # Mongoose schemas (Product, Transaction, IssuanceRecord)
   │   ├── routes/                    # Express routing logic
   │   ├── app.js                     # Express application setup
   │   ├── index.js                   # Main backend server entry point
   │   └── package.json               # Backend dependencies
   ├── frontend/                      # React Vite frontend application
   │   ├── public/                    # Static public assets
   │   ├── src/
   │   │   ├── assets/                # Visual assets like images and logos
   │   │   ├── components/            # Reusable UI components (Layout, UI modules, Scanners)
   │   │   ├── pages/                 # Full application views (Dashboard, Stock, Products, etc.)
   │   │   ├── utils/                 # API services and helpers (axios configurations)
   │   │   ├── App.jsx                # Main React router and global state provider
   │   │   ├── index.css              # Global styles
   │   │   └── main.jsx               # React application entry point
   │   ├── .env.example               # Example environment variables file
   │   ├── vite.config.js             # Vite configuration and API proxies
   │   └── package.json               # Frontend dependencies
   ├── ai-service/                    # Python FastAPI microservice for AI/ML
   │   ├── main.py                    # FastAPI app entry point
   │   ├── requirements.txt           # Python dependencies
   │   ├── training_data.py           # Synthetic/real training data for ML
   │   └── routers/                   # API routers (predictions, suggestions, alerts)
   │       ├── predictions.py         # ML model endpoints
   │       ├── suggestions.py         # Rule-based suggestions
   │       └── alerts.py              # Alert endpoints
   ```


## 5. Architecture and Flow

### System Architecture

The mobile app follows a client-server architecture, communicating with the Node.js backend via REST APIs. It uses React Native's component-based structure with context for state management. Key flows include:

- **Authentication Flow**: User logs in via API, token stored in AsyncStorage.
- **Data Fetching**: Screens fetch data from backend APIs on mount or refresh.
- **Offline Mode**: Cached data in AsyncStorage allows limited functionality offline.
- **Sync Process**: On reconnect, pending changes are synced to the backend.
- **AI Integration**: Predictions and alerts are fetched from the AI service via backend proxy.

### Request/Response Pattern

- **API Calls**: All requests use Axios with interceptors for auth headers and error handling.
- **Response Handling**: Success responses update local state; errors trigger user notifications.
- **Caching**: GET responses are cached in AsyncStorage for offline access.
- **Sync**: POST/PUT requests are queued if offline and sent on reconnect.

## 6. Data Models

The mobile app uses the same data models as the backend, serialized from MongoDB via Mongoose. Key models include:

- **Product**: { id, name, category, stockQuantity, barcode, description, createdAt, updatedAt }
- **Transaction**: { id, productId, type (IN/OUT), quantity, userId, timestamp, notes }
- **IssuanceRecord**: { id, jobId, materials: [{ productId, quantity }], issuedBy, issuedAt }
- **User**: { id, username, role, token } (stored locally for auth)

Data is fetched as JSON from the backend and mapped to local state or AsyncStorage.

## 7. API Endpoints

The app interacts with the backend REST API at `http://localhost:5000` (configurable via environment). Key endpoints used:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/auth/login` | User authentication |
| GET    | `/api/products` | Fetch products (with search/pagination) |
| PUT    | `/api/products/:id/stock` | Update stock quantity |
| POST   | `/api/transactions` | Record transaction |
| GET    | `/api/issuances` | Fetch issuance records |
| POST   | `/api/issuances` | Create issuance record |
| GET    | `/api/alerts` | Fetch AI alerts (via backend proxy) |
| POST   | `/predict/wastage` | AI wastage prediction (via backend) |

All requests include JWT auth headers.

## 8. Validation and Business Rules

- **Input Validation**: Forms use regex and required checks (e.g., barcode must be 12-13 digits).
- **Role-Based Access**: Supervisors can edit stock; workers can only view.
- **Stock Rules**: Stock cannot go negative; issuances require sufficient stock.
- **Transaction Rules**: All transactions must have a valid product ID and quantity > 0.
- **Offline Limits**: Edits are disabled offline; only viewing allowed.

## 9. Mobile Frontend Routes

Using React Navigation with stack and tab navigators:

- **Auth Stack**: Login Screen
- **Main Tab Navigator**:
  - Dashboard (Home): Overview of stock alerts and recent transactions
  - Products: List/search products, view details
  - Stock: Scan barcode to update stock
  - Transactions: View history, add new transaction
  - Issuances: View/add material issuances
  - Profile: User settings and logout

## 11. Local Setup

1. **Prerequisites**: Node.js 18+, npm/yarn, Expo CLI, Android Studio/iOS Simulator.
2. **Install Dependencies**:
   ```bash
   cd mobile
   npm install

## 12. Available Scripts
    **npm start / npx expo start: Start Expo development server.
    **npm run android: Run on Android emulator/device.
    **npm run ios: Run on iOS simulator.
    **npm test: Run Jest tests.
    **npm run lint: Run ESLint for code quality.

## 13. Current Module Status
    --Development Stage: Beta (core features implemented, testing ongoing).
    --Known Issues: Offline sync may fail on large datasets; barcode --scanning accuracy varies by device.
    --Coverage: 80% feature complete; AI integration partially implemented.

## 14. Error Handling
    --Network Errors: Toast notifications for API failures; retry logic   for transient issues.
    --Auth Errors: Redirect to login on 401/403.
    --Validation Errors: Inline form errors with user-friendly messages.
    --Crash Handling: Sentry integration for error reporting (planned).

## 15. Security Notes
    --Token Storage: JWT stored securely in AsyncStorage with encryption.
    --HTTPS: All API calls use HTTPS in production.
    --Input Sanitization: All user inputs sanitized to prevent injection.
    --Role Checks: API responses filtered by user role on client-side.

## 16. Future Improvements
    --Enhanced Offline Mode: Full CRUD offline with conflict resolution.
    --Push Notifications: Real-time alerts for stock changes or AI predictions.
    --Biometric Auth: Fingerprint/face unlock for quick access.
    --Advanced Scanning: Support for QR codes and batch scanning.
    --Performance Optimization: Lazy loading and pagination for large lists.
    --Testing Expansion: Add E2E tests with Detox.

----
*Built with  for Pavinthan.V, Jeeveith T.R, Meththasinghe M.D.D.T, Rajapaksha D.M.A.N, Gunasena P.G.P. Group Project.

