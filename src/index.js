import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext";

/*
Strict Mode causes certain effects (like useEffect) to run twice intentionally during development to detect side effects that aren't properly handled.

When you use tools like Create React App (CRA), Vite, or similar bundlers, process.env.NODE_ENV is automatically set to "development" during development. For example:

When you run npm start or yarn start, NODE_ENV is set to "development".
2. In Production
For production builds, it is set to "production". For example:

When you run npm run build or yarn build, NODE_ENV is set to "production".
3. In Testing
When you use testing tools like Jest, NODE_ENV is often set to "test".
*/
const root = ReactDOM.createRoot(document.getElementById("root"));
const isDev = process.env.NODE_ENV === "development";
root.render(
  isDev ?
    (
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    )
    :
    (
      <React.StrictMode>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </React.StrictMode>
    )
);
