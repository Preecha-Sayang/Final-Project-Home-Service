import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

type StatusListenerProps = {
  userId: number;
  onNewNotification: (data: { booking_id: number; new_status: string }) => void;
};

let socket: Socket;

export default function StatusListener({ userId, onNewNotification }: StatusListenerProps) {
  useEffect(() => {
    if (!socket) {
      socket = io({ path: "/api/socket" });
    }

    // สมัครเข้าห้องของ user
    socket.emit("register", userId);

    // ฟัง event statusUpdate
    socket.on("statusUpdate", (data) => {
      onNewNotification(data);
    });

    return () => {
      socket.off("statusUpdate");
    };
  }, [userId, onNewNotification]);

  return null;
}