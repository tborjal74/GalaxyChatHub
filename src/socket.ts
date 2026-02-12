import { io } from "socket.io-client";
import { API_URL } from "./config";

export const socket = io(API_URL, {
  autoConnect: false,
  // Recommended: ensures the connection is robust
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const connectSocket = (userId: string | number) => {
  // 1. Remove any existing listeners to prevent duplicate emissions
  socket.off("connect");

  // 2. Setup the "on connect" listener BEFORE connecting
  // This handles the initial connect AND any future auto-reconnects
  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    socket.emit("register_user", userId);
  });

  // 3. Trigger the connection
  if (!socket.connected) {
    socket.connect();
  } else {
    // If already connected, just emit immediately
    socket.emit("register_user", userId);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};