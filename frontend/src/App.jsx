import { BrowserRouter, Routes, Route } from "react-router-dom";

import SignIn from "./signin";
import Signup from "./signup";
import Dashboard from "./dashboard";
import Onboarding from "./onboarding";

export default function App() {
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