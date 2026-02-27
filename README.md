# 🏏 IPL Mock Auction - Real-Time Multiplayer App


**Live Demo:** [https://project-c-inky.vercel.app/]

## 🚀 Overview
The IPL Mock Auction is a full-stack, real-time multiplayer web application. It allows groups of friends to create private, isolated game rooms, select their favorite franchises, and participate in a live mock auction featuring a database of over 300+ real-world players. 

Built to handle simultaneous connections, race conditions in bidding, and live state synchronization across multiple clients using WebSockets.

## ✨ Key Features
* **Real-Time Multiplayer Rooms:** Users can generate a 4-letter room code to host private, isolated games without data crossover.
* **Live Socket Sync:** Sub-second synchronization of the current bid, highest bidder, and a synchronized 10-second countdown timer.
* **Role-Based Admin Controls:** The room creator is automatically assigned the Admin role, granting exclusive controls to start the auction and handle player transitions.
* **Dynamic Budget Tracking:** Real-time purse deduction and squad formatting (automatically converting Lakhs to Crores for high-value bids).
* **Live Player Pool:** A dynamic, horizontally scrolling player pool that allows managers to filter upcoming players by role (Batsman, Bowler, All-Rounder) and removes players instantly once sold.

## 🛠️ Tech Stack
**Frontend:**
* React.js
* Socket.io-client
* CSS3 / Inline Styling

**Backend:**
* Node.js
* Express.js
* Socket.io (WebSockets)
* Mongoose (`.lean()` queries optimized for large payloads)

**Database & Hosting:**
* MongoDB Atlas
* Vercel (Frontend Deployment)
* Render (Backend Deployment)

## 💻 Local Setup & Installation

If you want to run this project locally on your machine, follow these steps:

**1. Clone the repository:**
\`\`\`bash
git clone https://github.com/cartikeya/project-c.git
cd project-c
\`\`\`

**2. Setup the Backend:**
\`\`\`bash
cd server
npm install
\`\`\`
* Create a `.env` file in the `server` directory and add your MongoDB connection string:
  `MONGO_URI=your_mongodb_connection_string`
* Start the server:
\`\`\`bash
node server.js
\`\`\`

**3. Setup the Frontend:**
Open a new terminal window/tab:
\`\`\`bash
cd client
npm install
npm start
\`\`\`
*(Make sure to update the socket connection URL in `client/src/socket.js` to `http://localhost:3001` for local testing).*

## 🤝 Contact
Built by [cartikeya] - 3rd Year B.Tech Student
* LinkedIn: [https://www.linkedin.com/in/cartikeya-lavu-59577828a/]
* GitHub: [https://www.github.com/cartikeya]
