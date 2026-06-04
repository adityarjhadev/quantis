import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import SignIn from "./signin";
import Signup from "./signup";
import Dashboard from "./dashboard";
import Onboarding from "./onboarding";
import Signin from "./signin";

export default function App() {
  // ✅ hook MUST be inside component
  useEffect(() => {
    localStorage.removeItem("currentUser");
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}