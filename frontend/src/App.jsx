import { BrowserRouter, Routes, Route } from "react-router-dom";

import SignIn from "./signin";
import Signup from "./signup";
import Dashboard from "./dashboard";
import Onboarding from "./onboarding";
import { clearAuthData } from "./auth";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    try {
      if (!localStorage.getItem("authClearedOnce")) {
        clearAuthData();
        localStorage.setItem("authClearedOnce", "1");
      }
    } catch (e) {
      // ignore
    }
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/auth" element={<SignIn />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}