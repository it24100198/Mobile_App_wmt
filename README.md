# Denim Garment Management System — Product, Stock & AI Services

> **Note:** This module is part of the **IT24100480 - ITP_IT_118** group project.

## Project Overview

The Denim Garment Management System is a comprehensive web application built to streamline operations for denim manufacturing processes. This specific module focuses on **Product & Stock Management**, enabling users to manage product catalogs, monitor real-time stock levels, maintain inventory records via barcode scanning, and keep detailed logs of stock transactions and production line material issuances.

## Tech Stack


This project is built using the robust and modern MERN stack, with an additional Python-based AI microservice:

**Frontend**
- **React 19:** Building intuitive and interactive user interfaces.
- **Vite:** High-performance, blazing fast frontend build tool.
- **Tailwind CSS 4:** Utility-first CSS framework for rapid and responsive UI styling.


**Backend**
- **Node.js:** JavaScript runtime environment for backend execution.
- **Express 5:** Fast, unopinionated, minimalist web framework for building RESTful APIs.
- **MongoDB:** Flexible, scalable NoSQL database.
- **Mongoose:** Elegant MongoDB object modeling for Node.js.

**AI Service**
- **Python 3.11+**
- **FastAPI:** High-performance Python web framework for building APIs
- **scikit-learn, numpy, pandas:** For ML model training and inference

## Folder Structure


The repository is structured into three main applications: the `frontend`, the `backend`, and the `ai-service` (AI microservice).

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
   ```
   Make sure `VITE_API_URL` is set appropriately *(defaults to `http://localhost:5000`)*.

2. **Configure the Backend Environment:**
   *(Ensure you have a `.env` file in the backend directory containing variables like `PORT` and your MongoDB connection string `MONGODB_URI`)*.


### Running the Application

This project requires the `backend`, `frontend`, and (optionally) the `ai-service` servers to run concurrently during development.

**1. Start the Backend API**
```bash
cd backend
npm install
npm run dev
```

**2. Start the Frontend Application**
```bash
cd frontend
npm install
npm run dev
```

**3. Start the AI Service (Python FastAPI)**
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The frontend application will typically become accessible at `http://localhost:5173`, with API requests proxied securely to the backend on port `5000`. The AI service runs on `http://localhost:8000` and is called by the backend for ML predictions, suggestions, and alerts.


## API Endpoints

### Backend REST API (`http://localhost:5000`)

#### Products & Inventory
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/products` | Retrieve a list of products (supports search, category, and page params) |
| **POST** | `/api/products` | Create and register a new product |
| **PUT** | `/api/products/:id` | Update an existing product's details |
| **PATCH** | `/api/products/:id/stock` | Update stock quantity |
| **DELETE** | `/api/products/:id` | Delete a product entirely |

#### Transactions
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/transactions` | Retrieve stock transaction history |
| **POST** | `/api/transactions` | Record a new stock transaction (IN/OUT) |

#### Material Issuances
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/issuances` | Retrieve all recorded material issuances |
| **POST** | `/api/issuances` | Record materials issued to production lines |

### AI Service API (`http://localhost:8000`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/predict/wastage` | Predict fabric wastage % for a job |
| **POST** | `/predict/efficiency` | Predict production line efficiency |
| **GET**  | `/suggestions` | Get smart production suggestions |
| **GET**  | `/alerts` | Get active production alerts |
| **GET**  | `/health` | Health check for AI service |


## Environment Variables Configuration Table

| Application | Variable Name | Description | Example Default |
| :--- | :--- | :--- | :--- |
| **Frontend** | `VITE_API_URL` | Backend REST API Base URL | `http://localhost:5000` |
| **Frontend** | `VITE_DEV_API_PROXY_TARGET` | Fallback backend local proxy | `http://localhost:5000` |
| **Backend** | `PORT` | Local express backend port | `5000` |
| **Backend** | `MONGODB_URI` | MongoDB Connection string URI | `mongodb://localhost:27017/denim_db` |
| **Backend** | `CLIENT_ORIGIN` | Authorized CORS domains | `http://localhost:5173` |
| **AI Service** | (none required) | (Optional) Set via CLI or .env for advanced config | |
| **AI Service** | `PYTHONPATH` | (Optional) Python module path | |


## AI Service — Development Notes

- The AI microservice (`ai-service/`) is a FastAPI Python app providing ML predictions, smart suggestions, and production alerts.
- Install Python dependencies with `pip install -r requirements.txt`.
- Endpoints include `/predict/wastage`, `/predict/efficiency`, `/suggestions`, `/alerts`, and `/health`.
- Models are trained on synthetic and real data (see `training_data.py`).
- The Node.js backend calls this service for advanced analytics and recommendations.

---
*Built with ❤️ for Pavinthan.V, Jeeveith T.R, Meththasinghe M.D.D.T, Rajapaksha D.M.A.N, Gunasena P.G.P. Group Project.*

