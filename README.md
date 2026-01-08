# 🎨 Sketchup – A [skribbl.io](https://skribbl.io) Clone

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D%2014.0.0-brightgreen)
![React](https://img.shields.io/badge/react-%5E18.0.0-blue)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-black)

A beautiful, real-time multiplayer drawing and guessing game built with the MERN stack. Challenge your friends, unleash your creativity, and have fun guessing drawings in real-time!

---

## 🚀 Live Demo

**Experience the game live on Render:**

### [👉 Play Scribble Clone Now](https://sketchup-frontend.onrender.com/)

---

## ✨ Key Features

- **🎨 Interactive Whiteboard**: Smooth, real-time drawing experience powered by **RoughJS** and **Socket.io**.
- **⚡ Real-Time Multiplayer**: Instant updates for drawings, chat messages, and game state changes.
- **🗣️ Live Chat & Guessing Check**: Integrated chat system that automatically detects correct guesses and hides them from other players.
- **🏠 Lobby & Room Management**: Create private rooms or join existing ones to play with friends.
- **📝 Custom Word Lists**: Hosts can choose from different word categories for varied gameplay.
- **🔐 Secure Authentication**: User accounts protected with JWT authentication.
- **🏆 Scoring System**: Automated scoring based on speed and accuracy.

---

## 🛠️ Tech Stack

### Frontend

- **React**: Core framework for building the user interface.
- **Vite**: Fast build tool and development server.
- **TailwindCSS**: Utility-first CSS framework for modern, responsive styling.
- **RoughJS**: For that hand-drawn, sketchy look on the canvas.
- **Socket.io-client**: For real-time bi-directional communication with the server.
- **React Router**: For seamless client-side navigation.

### Backend

- **Node.js & Express**: Robust server-side runtime and framework.
- **MongoDB & Mongoose**: NoSQL database for flexible data storage (Users, Rooms, WordLists).
- **Socket.io**: The engine behind the real-time game logic.
- **JWT (JSON Web Tokens)**: Stateless authentication mechanism.

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URL)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/sketchup-clone.git
cd sketchup-clone
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:

```bash
npm start
# Server will run on http://localhost:5000
```

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
# Frontend will usually run on http://localhost:5173
```

---

## 📂 Project Structure

```bash
sketchup-clone/
├── backend/            # Server-side code
│   ├── config/         # Database configuration
│   ├── controllers/    # Request handlers
│   ├── models/         # Mongoose models (User, Room, WordList)
│   ├── routes/         # API routes
│   └── server.js       # Entry point & Socket.io setup
│
└── frontend/           # Client-side code
    ├── src/
    │   ├── Components/ # Reusable UI components
    │   ├── Pages/      # Full page views (Home, Room, Login, etc.)
    │   ├── context/    # Global state management
    │   └── App.jsx     # Main application component
    └── package.json    # Frontend dependencies
```

---

## 📝 License

Distributed under the MIT License. See `package.json` for more information.

---

Made with ❤️ by [Shakti Sankpal](https://github.com/shaktisankpal)
