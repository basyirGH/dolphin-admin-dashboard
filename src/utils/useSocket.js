import { useEffect, useMemo } from "react";
import socketIO from "socket.io-client";
import { useAuth } from "./AuthContext"; // Adjust the path as needed

// Use WebSocket transport - disable polling. 
// polling is default transport mechanism for compatibility with 
// environments that do not fully support WebSocket. When polling is used, 
// Socket.IO sends multiple HTTP requests (like GET, POST, and OPTIONS) 
// during the connection lifecycle, especially for establishing the handshake before upgrading to a WebSocket connection
const useSocket = () => {
  const { token, isAuthenticated } = useAuth();

  const socket = useMemo(() => {
    if (!isAuthenticated) return null;
    document.cookie = `Authorization=${token}; path=/;`;
    return socketIO.connect("http://localhost:8081", {
      extraHeaders: {
        Authorization: token,
      },
      transports: ["websocket"],
    });
  }, [token, isAuthenticated]);

  useEffect(() => {
    if (!socket) return;
    // Cleanup logic to disconnect the socket when the component unmounts
    return () => {
      if (socket.connected) {
        socket.disconnect();
        console.log("Socket disconnected");
      };

    };
  }, [socket]);

  return socket;
};


export default useSocket;
