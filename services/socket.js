// services/socket.js
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SOCKET_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace("/api", "") ||
  "http://10.0.2.2:5000";

let socket = null;

export const connectSocket = async () => {
  if (socket?.connected) return socket;
  const token = await AsyncStorage.getItem("token");
  if (!token) return null;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => console.log("🔌 Socket connected"));
  socket.on("disconnect", () => console.log("🔴 Socket disconnected"));
  socket.on("connect_error", (e) => console.log("Socket error:", e.message));

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const getSocket = () => socket;
