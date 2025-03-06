import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Preview from "./page/ExampleModelPreview.jsx"; // Import the Preview component

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/example/:model" element={<Preview />} />
      </Routes>
    </Router>
  </StrictMode>
);
