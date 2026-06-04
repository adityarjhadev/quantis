import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "./auth";

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();

    if (!email || !password) return;

    const res = signup(email, password);

    if (!res.ok) {
      alert("Account already exists → redirecting to login");
      navigate("/signin");
      return;
    }

    navigate("/dashboard");
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) navigate("/dashboard");
  }, [navigate]);

  return (
    <div style={styles.page}>
      <div style={styles.bgBubble} />
      <div style={styles.bgBubble2} />
      <div style={styles.glow} />

      <div style={styles.card}>
        <h1 style={styles.title}>Create your account</h1>

        <p style={styles.subtitle}>
          Start your personalized Quantis experience with secure signup and instant access to the dashboard.
        </p>

        <form onSubmit={handleSignup} style={styles.form}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.button} type="submit">
            Continue to dashboard →
          </button>
        </form>

        <p style={styles.text}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/signin")}>
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "radial-gradient(1200px 600px at 50% -10%, rgba(214,198,166,0.12), transparent 60%), #0b0b0b",
    color: "white",
    fontFamily:
      "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    overflow: "hidden",
    position: "relative",
  },

  bgBubble: {
    position: "absolute",
    width: "520px",
    height: "520px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(214,198,166,0.18), rgba(214,198,166,0.06) 40%, transparent 70%)",
    filter: "blur(40px)",
    animation: "float1 10s ease-in-out infinite",
  },

  bgBubble2: {
    position: "absolute",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(255,255,255,0.12), rgba(214,198,166,0.08) 40%, transparent 70%)",
    filter: "blur(50px)",
    animation: "float2 12s ease-in-out infinite",
  },

  glow: {
    position: "absolute",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(214,198,166,0.15), transparent 70%)",
    filter: "blur(60px)",
    animation: "pulse 4s ease-in-out infinite",
  },

  card: {
    width: "380px",
    padding: "28px",
    borderRadius: "16px",
    background: "rgba(21,21,21,0.7)",
    border: "1px solid rgba(214,198,166,0.18)",
    backdropFilter: "blur(12px)",
    boxShadow:
      "0 0 60px rgba(214,198,166,0.08), 0 0 40px rgba(0,0,0,0.6)",
    zIndex: 2,
  },

  title: { marginBottom: "8px" },

  subtitle: {
    fontSize: "13px",
    color: "#aaa",
    marginBottom: "16px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #2a2a2a",
    background: "#0f0f0f",
    color: "white",
    outline: "none",
  },

  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #ffffff, #d6c6a6)",
    color: "black",
    cursor: "pointer",
    marginTop: "10px",
    fontWeight: "600",
    boxShadow: "0 8px 24px rgba(214,198,166,0.25)",
  },

  text: {
    marginTop: "12px",
    fontSize: "12px",
    color: "#aaa",
  },

  link: {
    color: "white",
    cursor: "pointer",
    textDecoration: "underline",
  },
};