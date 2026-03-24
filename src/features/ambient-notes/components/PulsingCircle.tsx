import React from "react";

interface PulsingCircleProps {
  active: boolean;
}

const pulseKeyframes = `
@keyframes ambient-pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.12); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes ambient-ring {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.8); opacity: 0; }
}
`;

export const PulsingCircle: React.FC<PulsingCircleProps> = ({ active }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0", position: "relative" }}>
      <style>{pulseKeyframes}</style>
      {active && (
        <div
          style={{
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: "50%",
            border: "2px solid rgba(249, 115, 22, 0.3)",
            animation: "ambient-ring 2s ease-out infinite",
          }}
        />
      )}
      <div
        style={{
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: active
            ? "radial-gradient(circle at 35% 35%, #FB923C 0%, #F97316 40%, #EA580C 80%, #C2410C 100%)"
            : "radial-gradient(circle at 35% 35%, #525252 0%, #404040 40%, #333333 80%, #262626 100%)",
          boxShadow: active
            ? "0 0 60px rgba(249, 115, 22, 0.35), 0 0 120px rgba(249, 115, 22, 0.15), inset 0 -4px 12px rgba(0,0,0,0.3)"
            : "0 0 20px rgba(0,0,0,0.3), inset 0 -4px 12px rgba(0,0,0,0.3)",
          animation: active ? "ambient-pulse 2s ease-in-out infinite" : "none",
          transition: "box-shadow 0.4s ease, background 0.4s ease",
        }}
      />
    </div>
  );
};
