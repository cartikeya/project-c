import io from "socket.io-client";
// export const socket = io.connect("https://project-c-jrzu.onrender.com/");





// Comment out the live Render URL for now!
export const socket = io.connect("https://ipl-auction-backend.onrender.com");

// Use your local server while adding new features:
// export const socket = io.connect("http://localhost:3001");