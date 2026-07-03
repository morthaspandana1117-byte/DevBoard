# 🚀 DevBoard

DevBoard is a full-stack **MERN Project Management System** designed to help teams organize projects and collaborate efficiently through a Kanban workflow. It provides secure authentication, task management, drag-and-drop functionality, real-time notifications, analytics, file uploads, and email reminders.

## 🌐 Live Demo

* **Frontend:** https://dev-board-xi.vercel.app
* **Backend API:** https://devboard-backend-e6qk.onrender.com

## ✨ Features

* 🔐 JWT Authentication & Protected Routes
* 📋 Board & Task Management (CRUD)
* 📌 Drag & Drop Kanban Board
* 👥 Task Assignment & Due Dates
* 📎 File Uploads for Tasks
* 🔔 Real-time Notifications using Socket.IO
* 📧 Email Reminder System
* 📊 Analytics Dashboard
* 📱 Responsive User Interface

## 🛠️ Tech Stack

**Frontend**

* React.js
* Vite
* React Router
* Axios
* CSS

**Backend**

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Socket.IO
* Multer
* Node Cron

**Deployment**

* Vercel
* Render
* MongoDB Atlas

## 🚀 Installation

### Clone the Repository

```bash
git clone https://github.com/morthaspandana1117-byte/DevBoard.git
cd DevBoard
```

### Backend Setup

```bash
cd backend
npm install
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## ⚙️ Environment Variables

### Backend (.env)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_app_password

# Local Development
CLIENT_URL=http://localhost:5173

# Production
# CLIENT_URL=https://dev-board-xi.vercel.app
```

### Frontend (.env)

```env
# Local Development
VITE_API_URL=http://localhost:5000/api

# Production
# VITE_API_URL=https://devboard-backend-e6qk.onrender.com/api
```

## 📂 Project Structure

```text
DevBoard
├── backend
├── frontend
└── README.md
```

## 👩‍💻 Author

**Spandana Mortha**

* GitHub: https://github.com/morthaspandana1117-byte
* LinkedIn: https://linkedin.com/in/spandana-mortha-09103234b
