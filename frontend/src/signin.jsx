import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { login, getCurrentUser } from "./auth";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hovered, setHovered] = useState(false);

  // Auto redirect if already logged in
  useEffect(() => {
    const user = getCurrentUser();
    if (user) navigate("/dashboard");
  }, [navigate]);

  const handleSignin = () => {
    if (!email || !password) return;

    const res = login(email, password);

    if (!res.ok) {
      alert("Invalid credentials");
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div
      className="auth-page"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div className="auth-glow" />
      <div className="auth-glow-2" />

      <div
        className="auth-card"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          transform: hovered
            ? "translateY(-6px) scale(1.015)"
            : "translateY(0px) scale(1)",
          transition: "all 0.25s ease",
          boxShadow: hovered
            ? "0 0 45px rgba(214, 198, 166, 0.28)"
            : "0 0 0px rgba(0,0,0,0)"
        }}
      >
        <div className="auth-badge">Quantis Access</div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">
          Sign in to continue your league journey
        </p>

        <div className="auth-form">
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="auth-button" onClick={handleSignin}>
            Enter Quantis →
          </button>
        </div>

        <p className="auth-switch">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/signup")}>
            Create one
          </span>
        </p>
      </div>
    </div>
  );
}