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
* Copy `server/.env.example` to `.env`; set `MONGO_URI` and a unique `JWT_SECRET` of at least 32 random bytes. Keep the provided Google Web Client ID or replace it consistently in frontend and backend settings.
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
*(Set `REACT_APP_API_URL=http://localhost:3001` in `client/.env.local` for local testing.)*

## 🤝 Contact
Built by [cartikeya] - 3rd Year B.Tech Student
* LinkedIn: [https://www.linkedin.com/in/cartikeya-lavu-59577828a/]
* GitHub: [https://www.github.com/cartikeya]


## Google sign-in and saved auction rooms

The app now requires Google sign-in. The backend verifies Google's ID token, creates a short-lived app session, and stores each signed-in user's latest room/team association. Auction rooms, bids, the current player, timer state, pause state, budgets, and squads are stored in MongoDB. After closing a tab, sign in again with the same Google account to restore the saved room; the same works on another device and after a backend restart. The session token is limited to the current tab and expires after 12 hours. Rooms are retained in MongoDB; there is no automatic room-expiration cleanup.

### Google OAuth setup

1. In Google Cloud Console, create an OAuth 2.0 **Web application** client and configure the consent screen. Add the local origin `http://localhost:3000` and the production Vercel origin under **Authorized JavaScript origins**. Add any Vercel preview origins you intend to use.
2. Set the same public Web Client ID in both environments. In Vercel, add `REACT_APP_GOOGLE_CLIENT_ID` and `REACT_APP_API_URL` and redeploy the frontend. In Render, add `GOOGLE_CLIENT_ID` and `JWT_SECRET`; keep the existing `MONGO_URI` and set `CLIENT_ORIGIN` to the frontend origin(s). Use a long, random `JWT_SECRET` and never commit it.
3. For local development, copy `client/.env.example` to `client/.env.local` and `server/.env.example` to `server/.env`, then fill in the Web Client ID and MongoDB connection. Generate a unique JWT secret of at least 32 random bytes (for example, `openssl rand -base64 48`) for each environment. The Google OAuth client does not need a client secret for this ID-token flow.

Google's setup guide: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid. `client/vercel.json` and the root `vercel.json` set `Cross-Origin-Opener-Policy: same-origin-allow-popups` for the Google popup flow (Vercel uses the config in the configured project root). The frontend and backend changes must both be deployed; if the new auth API returns 404, deploy the updated server before retrying. Local client changes require a frontend rebuild; server environment changes require a backend restart/redeploy.

## Player portraits

`server/playersData.json` may include `img` plus the image title, source page, creator credit, and license URL. Portraits are added only when Wikimedia Commons exposes an exact-name file with an explicit CC BY/CC BY-SA, CC0, or Public Domain license and attribution metadata; records without a cleared image keep the generated-avatar fallback. The auction card and player pool link each photo credit to its Commons file page. The server syncs image metadata into matching MongoDB player records at startup without deleting or reseeding auction data. `server/scripts/enrich_player_images.py` can repeat this license-filtered lookup; it writes to a separate output path by default and should be reviewed before replacing the roster JSON.


Commons cautions that photo licensing metadata does not grant separate personality, publicity, privacy, or trademark rights. Review those restrictions for the intended jurisdiction and before commercial or app-store distribution.
