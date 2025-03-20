import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

// Use WebSocket transport - disable polling. 
// polling is default transport mechanism for compatibility with 
// environments that do not fully support WebSocket. When polling is used, 
// Socket.IO sends multiple HTTP requests (like GET, POST, and OPTIONS) 
// during the connection lifecycle, especially for establishing the handshake before upgrading to a WebSocket connection

/*
A new Socket instance is returned for the namespace specified by the pathname in the URL, defaulting to /. For example, if the url is http://localhost/users, a transport connection will be established to http://localhost and a Socket.IO connection will be established to /users.
*/
const useSocket = () => {
  const { token, isAuthenticated, firstAttemptDone } = useAuth();
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const attemptDelay = 1000;
  const SOCKET_URL = "https://dolphin-socket-700663601715.asia-southeast1.run.app"

  useEffect(() => {
    if (!isAuthenticated && firstAttemptDone) {
      setSocket(null);
      setMessage("(auth failure).");
      setAttemptCount(0);
      return;
    }

    const conn = io(SOCKET_URL, {
      reconnectionDelayMax: attemptDelay,
      transports: ["websocket"],
      query: { token },
    });

    // const conn = io("http://localhost:8081", {
    //   reconnectionDelayMax: attemptDelay,
    //   transports: ["websocket"],
    //   query: { token },
    // });

    conn.on("connect", () => {
      setSocket(conn);
      setMessage("(connected)");
      setAttemptCount(0); // Reset on successful connection
    });

    conn.on("connect_error", (error) => {
      setSocket(null);
      setMessage("(connection failure: " + error + "). retrying...");
      setAttemptCount((prevCount) => prevCount + 1);
    });

    return () => {
      if (conn.connected) {
        conn.disconnect();
      }
    };
  }, [token, isAuthenticated]);

  // Ensure `message` and `attemptCount` updates are tracked
  useEffect(() => {
  }, [attemptCount, message]);

  return { socket, message, attemptCount }; // Destructure these in components
};

export default useSocket;
