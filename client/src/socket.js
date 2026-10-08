import { io } from "socket.io-client";

const DEFAULT_API_URL = "https://project-c-jrzu.onrender.com";
export const API_BASE_URL = (process.env.REACT_APP_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");

// App connects only after restoring or completing the required Google sign-in.
export const socket = io(API_BASE_URL, {
  autoConnect: false,
  reconnection: true,
});
