import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import HomePage from "./pages/HomePage.jsx";
import AssignPage from "./pages/AssignPage.jsx";
import GradeDashboardPage from "./pages/GradeDashboardPage.jsx";
import CountdownPage from "./pages/CountdownPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/assign" element={<AssignPage />} />
        <Route path="/m1" element={<GradeDashboardPage grade={1} />} />
        <Route path="/m2" element={<GradeDashboardPage grade={2} />} />
        <Route path="/m3" element={<GradeDashboardPage grade={3} />} />
        <Route path="/m4" element={<GradeDashboardPage grade={4} />} />
        <Route path="/m1/countdown" element={<CountdownPage grade={1} />} />
        <Route path="/m2/countdown" element={<CountdownPage grade={2} />} />
        <Route path="/m3/countdown" element={<CountdownPage grade={3} />} />
        <Route path="/m4/countdown" element={<CountdownPage grade={4} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
