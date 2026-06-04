import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const nav = useNavigate();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 300),
      setTimeout(() => setStage(2), 2000),
      setTimeout(() => setStage(3), 3200),
      setTimeout(() => {
        setStage(4);
        nav("/onboarding");
      }, 4300),
    ];

    return () => timers.forEach(clearTimeout);
  }, [nav]);

  return (
    <div
      style={{
        ...styles.container,
        background: stage >= 3 ? "#000" : "#d6c6a6",
      }}
    >
      <div
        style={{
          ...styles.line,
          transform: stage >= 1 ? "scaleX(1)" : "scaleX(0)",
          opacity: stage >= 3 ? 0 : 1,
        }}
      />

      {stage === 3 && <div style={styles.flash} />}
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "background 0.8s ease",
    position: "relative",
  },
  line: {
    position: "absolute",
    width: "60%",
    height: "2px",
    background: "#14130f",
    transformOrigin: "center",
    transition: "transform 2.4s ease, opacity 0.3s ease",
  },
  flash: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.92)",
    animation: "flash 1.1s ease",
  },
  content: {
    textAlign: "center",
    color: "#111",
    animation: "fadeIn 1s ease",
  },
  title: {
    fontSize: "48px",
    margin: 0,
    letterSpacing: "-1px",
  },
  subtitle: {
    marginTop: "10px",
    opacity: 0.7,
  },
  button: {
    marginTop: "20px",
    padding: "12px 18px",
    borderRadius: "999px",
    border: "none",
    color: "#d6c6a6",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 180ms ease, transform 180ms ease",
  },
};
