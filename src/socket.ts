import { io } from "socket.io-client";
import { API_URL } from "./config";

export const socket = io(API_URL, {
  autoConnect: false,
});

export const connectSocket = (userId: string | number) => {
  if (!socket.connected) {
    socket.connect();
  }

  socket.emit("register_user", userId);
};
