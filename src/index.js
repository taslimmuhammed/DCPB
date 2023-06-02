import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import "./styles/globals.css";
import { BrowserRouter as Router } from "react-router-dom";
import Ethers from "./Contexts/EthersContext";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ToastContainer />
    <ThirdwebProvider activeChain="mumbai">
      <Router>
        <Ethers>
      <App />
      </Ethers>
      </Router>
    </ThirdwebProvider>
  </React.StrictMode>
);

reportWebVitals();
