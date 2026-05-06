import React from "react";
import { useApp } from "../AppContext";

export const Welcome: React.FC = () => {
  const { setStep } = useApp();

  return (
    <div
      className="glass-panel text-center pulse-container"
      style={{ width: "100%", cursor: "pointer", position: "relative" }}
      onClick={() => setStep("team_select")}
    >
      <div style={{ marginBottom: "1rem" }}>
        <img
          src="/logo.png"
          alt="Logo"
          style={{
            maxHeight: "100px",
            borderRadius: "12px",
            backgroundColor: "white",
            boxShadow: "0 0 10px white",
            padding: "28px"
          }}
        />
      </div>

      <div className="arcade-title fade-in">
        <h1 className="glitch" data-text="LIKE SCORE">
          LIKE SCORE
        </h1>
        <h2 className="subtitle">TEAM COMPATIBILITY TEST</h2>
      </div>

      <div className="tap-to-start bounce">
        <p>TAP ANYWHERE TO START</p>
      </div>

      <div className="decorations">
        <span className="star star-1">✨</span>
        <span className="star star-2">🎮</span>
        <span className="star star-3">🚀</span>
      </div>
    </div>
  );
};

export default Welcome;
