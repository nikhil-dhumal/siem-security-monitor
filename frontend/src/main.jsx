// ============================================================
// FILE: frontend/src/main.jsx
// Vite + React entry point
// Mounts <App /> into the #root div in index.html
// ============================================================

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/globals.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);