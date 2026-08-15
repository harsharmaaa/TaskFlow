# TaskFlow — Real-Time Collaborative Task Board

TaskFlow is a premium, high-performance collaborative Kanban workspace app built with the MERN stack. Designed with a sleek glassmorphic dark theme, TaskFlow connects teams with instant real-time synchronization, permission-controlled member management, inline detail editors, autocomplete mentions, notifications alerts, and an activity audit log.

---

## ⚡ Features

- 🕒 **Real-Time Board Sync**: Powered by Socket.io. Task updates, movements, creations, and deletions sync instantly across all logged-in collaborators' devices.
- 🔐 **Role-Based Access Control (RBAC)**: Fine-grained permissions (Admin, Manager, Member) control boards, columns, team modifications, and task deletions.
- 🚀 **Drag-and-Drop Task Board**: Interactive column boards powered by `@dnd-kit` with touch and pointer support, updating positions optimistically.
- 💬 **Mentions Autocomplete & Comments**: Tag collaborators using `@Name` with instant dropdown autocomplete filters. Mentions trigger database logs and direct user notification events.
- 📎 **Rich Task Details**: Edit descriptions, select collaborative assignees, picker calendar dates, manage tag labels, and stream file attachments directly to Cloudinary.
- 📜 **Activity Audit Log**: Tracks board adjustments, comments, attachments, membership changes, and task details inside a clear, readable chronological timeline.
- 🔍 **Dynamic Search & Filters**: Client-side filters isolate tasks by title keywords, assignees, priority indicators, and tag labels.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js (built on Vite)
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit (RTK)
- **Real-Time Sync**: Socket.io-client
- **Drag & Drop**: `@dnd-kit/core` & `@dnd-kit/sortable`
- **Routing**: React Router v6
- **Notifications**: React Hot Toast

### Backend
- **Framework**: Node.js & Express
- **Database**: MongoDB (managed via Mongoose)
- **Real-Time Gateway**: Socket.io Server
- **File Storage**: Cloudinary SDK (streamed via Multer storage)
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs

---

## 📂 Project Structure

```bash
TaskFlow/
├── client/              # React Frontend (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI parts (Navbar, Column, Bell, DetailModal)
│   │   ├── hooks/       # Custom hooks (useSocket)
│   │   ├── pages/       # Core pages (Landing, Dashboard, BoardView, TeamMembers)
│   │   ├── services/    # API request mapping modules
│   │   └── store/       # Redux Toolkit slices
│   └── vercel.json      # Vercel SPA routing redirects configuration
└── server/              # Express Backend & Sockets
    ├── config/          # DB connection & Cloudinary storage setups
    ├── controllers/     # Route logic controllers
    ├── middleware/      # Auth JWT guards and RBAC board checking rules
    ├── models/          # Mongoose database models
    ├── routes/          # API endpoint paths
    ├── sockets/         # Socket.io connection and emitter helpers
    └── server.js        # Root entrypoint
```

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Database URI (Local or Atlas)
- Cloudinary Storage Account credentials

### 1. Clone the repository
```bash
git clone https://github.com/harsharmaaa/TaskFlow.git
cd TaskFlow
```

### 2. Configure Backend Env Vars
Create `server/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_signing_token_string
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

Install backend dependencies and boot up nodemon:
```bash
cd server
npm install
npm run dev
```

### 3. Configure Frontend Env Vars
Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Install frontend dependencies and start Vite dev server:
```bash
cd ../client
npm install
npm run dev
```

The application will launch on `http://localhost:5173`.

---

## 🌐 Production Deployment

### Backend (Render.com)
1. Register a **New Web Service** pointing to your repository.
2. Select root directory as `server`.
3. Set Build Command: `npm install` and Start Command: `node server.js`.
4. Inject all Environment Variables from `server/.env`.
5. Once running, copy your Render API URL (e.g. `https://taskflow-api.onrender.com`).

### Frontend (Vercel)
1. Add a **New Project** pointing to your repository.
2. Select root directory as `client` and choose **Vite** preset.
3. Configure Environment Variables:
   - `VITE_API_URL` = `https://your-render-url.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://your-render-url.onrender.com`
4. Deploy the project.
5. Go back to Render's service dashboard and update `CLIENT_URL` with your Vercel URL to allow CORS authorization.

---

## 📄 License
This project is licensed under the ISC License.