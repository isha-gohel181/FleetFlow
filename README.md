# FleetFlow 🚛

A comprehensive **Fleet & Logistics Management System** designed to streamline vehicle fleet operations, driver management, trip tracking, fuel monitoring, and maintenance scheduling.

---

## 👥 Team Members

| # | Name | Email |
|---|------|-------|
| 1 | **Isha Gohel** (Team Leader) | ishagohel181@gmail.com |
| 2 | Dhatri Paladiya | dhatripatel67@gmail.com |
| 3 | Pooja Solanki | psolanki131004@gmail.com |

---

## 🛠️ Tech Stack

### Frontend
- **React.js 19** - Modern UI library
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Beautifully designed components
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Recharts** - Data visualization library
- **React Hook Form + Zod** - Form handling & validation
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

---

## ✨ Features

- **🔐 Authentication & Authorization** - Secure login/register with JWT and role-based access control (RBAC)
- **🚗 Vehicle Management** - Add, edit, track, and manage fleet vehicles
- **👨‍✈️ Driver Management** - Manage driver profiles and assignments
- **🗺️ Trip Tracking** - Create, monitor, and complete trips
- **⛽ Fuel Logging** - Track fuel consumption and costs
- **🔧 Maintenance Scheduling** - Log and monitor vehicle maintenance
- **📊 Analytics Dashboard** - Visual insights with charts and metrics
- **📱 Responsive Design** - Works seamlessly on all devices

---

## 📁 Project Structure

```
FleetFlow/
├── backend/
│   ├── server.js              # Entry point
│   └── src/
│       ├── app.js             # Express app configuration
│       ├── config/            # Database & app configuration
│       ├── controllers/       # Request handlers
│       ├── middleware/        # Auth, RBAC, validation, error handling
│       ├── models/            # Mongoose schemas
│       ├── routes/            # API routes
│       └── utils/             # Utilities & helpers
│
├── frontend/
│   └── src/
│       ├── components/        # Reusable UI components
│       │   ├── charts/        # Data visualization
│       │   ├── common/        # Shared components
│       │   ├── layout/        # App layout components
│       │   └── ui/            # shadcn/ui components
│       ├── contexts/          # React context providers
│       ├── pages/             # Page components
│       ├── services/          # API service functions
│       └── utils/             # Frontend utilities
│
└── README.md
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/fleetflow.git
cd fleetflow
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fleetflow
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

---

## ▶️ Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```
The backend server will start at `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```
The frontend will be available at `http://localhost:5173`

### Seed Database (Optional)

To populate the database with sample data:

```bash
cd backend
npm run seed
```

---

## 🔌 API Endpoints

| Module | Endpoint | Description |
|--------|----------|-------------|
| **Auth** | `POST /api/auth/register` | Register new user |
| | `POST /api/auth/login` | User login |
| **Vehicles** | `GET /api/vehicles` | Get all vehicles |
| | `POST /api/vehicles` | Create vehicle |
| | `PUT /api/vehicles/:id` | Update vehicle |
| | `DELETE /api/vehicles/:id` | Delete vehicle |
| **Drivers** | `GET /api/drivers` | Get all drivers |
| | `POST /api/drivers` | Create driver |
| | `PUT /api/drivers/:id` | Update driver |
| | `DELETE /api/drivers/:id` | Delete driver |
| **Trips** | `GET /api/trips` | Get all trips |
| | `POST /api/trips` | Create trip |
| | `PATCH /api/trips/:id/status` | Update trip status |
| **Fuel** | `GET /api/fuel` | Get fuel logs |
| | `POST /api/fuel` | Add fuel log |
| **Maintenance** | `GET /api/maintenance` | Get maintenance logs |
| | `POST /api/maintenance` | Add maintenance log |
| **Analytics** | `GET /api/analytics` | Get analytics data |

---

## 🔐 Environment Variables

### Backend

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/fleetflow` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key` |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `NODE_ENV` | Environment mode | `development` |

---

## 📜 Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with hot reload |
| `npm run seed` | Seed database with sample data |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

<p align="center">
  Made with ❤️ by the FleetFlow Team
</p>
