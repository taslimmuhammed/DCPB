import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import "./styles/globals.css";
import { BrowserRouter as Router } from "react-router-dom";
const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ThirdwebProvider activeChain="localhost">
      <Router>
      <App />
      </Router>
    </ThirdwebProvider>
  </React.StrictMode>
);

reportWebVitals();
