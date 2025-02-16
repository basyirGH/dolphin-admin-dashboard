import { useEffect, useMemo } from "react";
import socketIO from "socket.io-client";
import { useAuth } from "./AuthContext"; // Adjust the path as needed
import { useNavigate } from "react-router-dom";

// Use WebSocket transport - disable polling. 
// polling is default transport mechanism for compatibility with 
// environments that do not fully support WebSocket. When polling is used, 
// Socket.IO sends multiple HTTP requests (like GET, POST, and OPTIONS) 
// during the connection lifecycle, especially for establishing the handshake before upgrading to a WebSocket connection
const useSocket = () => {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const socket = useMemo(() => {
    if (!isAuthenticated){console.log("not auth"); return null};
    /*
    The document.cookie property in JavaScript is used to read, create, modify, and delete cookies in the browser. Cookies are small pieces of data stored on the client side (in the browser) and are sent to the server with every HTTP request. They are commonly used for session management, user preferences, and tracking.

    path=/: This specifies the path on the server where the cookie is valid. Setting it to / means the cookie is accessible across the entire domain.
    */
    document.cookie = `Authorization=${token}; path=/;`;
    return socketIO.connect("http://localhost:8081", {
      // extraHeaders: {
      //   Authorization: token,
      // }, // does not work, use cookies instead
      transports: ["websocket"],
    });
  }, [token, isAuthenticated]);

  useEffect(() => {

    if (!socket) return;

    // Listen for connection errors
    socket.on("connect_error", (error) => {
      console.error("Socket connection failed:", error.message);
      //navigate("/login");
    });

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
