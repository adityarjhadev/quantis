import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(circle at top, #2b2f38, #07080b 55%)",
      color: "white",
      padding: "24px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "520px",
        borderRadius: "32px",
        padding: "42px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 40px 90px rgba(0,0,0,0.25)",
      }}>
        <h1 style={{ margin: 0, fontSize: "2.5rem" }}>Welcome back</h1>
        <p style={{ color: "#a6b1c8", marginTop: "16px", lineHeight: 1.8 }}>
          Sign in to continue to your Quantis experience and keep your watchlists, alerts, and onboarding flow synced.
        </p>
        <button
          onClick={() => navigate("/onboarding")}
          style={{
            marginTop: "28px",
            width: "100%",
            padding: "16px 18px",
            borderRadius: "999px",
            border: "none",
            background: "#d6c6a6",
            color: "#0b0b0d",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Back to onboarding
        </button>
      </div>
    </div>
  );
}
