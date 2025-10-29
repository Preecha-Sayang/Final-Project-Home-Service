"use client";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

type Notification = {
  booking_id: number;
  order_code: string;
  new_status: string;
};

type Props = {
  userId: number;
  onNewNotification: (data: Notification) => void;
};

// ใช้ singleton socket เพื่อ reconnect-safe
let socket: Socket | null = null;

export default function StatusListener({ userId, onNewNotification }: Props) {
  const onNewNotificationRef = useRef(onNewNotification);
  useEffect(() => {
    onNewNotificationRef.current = onNewNotification;
  }, [onNewNotification]);

  useEffect(() => {
    if (!socket) {
      socket = io("http://localhost:3000", {
        path: "/api/socket",
        transports: ["polling", "websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      socket.on("connect", () => {
        // console.log("🟢 Socket connected:", socket?.id);
        socket?.emit("register", userId);
      });

      socket.on("disconnect", (reason) => {
        console.log("⚠️ Socket disconnected:", reason);
      });

      socket.on("connect_error", (err) => {
        console.warn("⚠️ Socket connect error (ignored in dev):", err.message);
      });
    } else {
      // ถ้า socket already connected, register userId
      if (socket.connected) socket.emit("register", userId);
    }

    const handleStatusUpdate = (data: Notification) => {
      onNewNotificationRef.current(data);
    };

    socket.on("statusUpdate", handleStatusUpdate);

    return () => {
      socket?.off("statusUpdate", handleStatusUpdate);
    };
  }, [userId]);

  return null;
}
