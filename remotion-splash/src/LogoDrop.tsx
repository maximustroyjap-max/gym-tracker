import { useCurrentFrame, useVideoConfig, spring, interpolate, staticFile } from "remotion";

const COLORS = {
  primary: "#00FF88",
};

export const LogoDrop = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Heavy drop with bounce
  const dropProgress = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 180,
      mass: 1.2,
    },
  });

  const translateY = interpolate(dropProgress, [0, 1], [-400, 0]);
  const scale = interpolate(dropProgress, [0, 0.3, 0.6, 1], [0.3, 1.15, 0.95, 1]);
  const rotate = interpolate(dropProgress, [0, 0.5, 1], [-15, 5, 0]);
  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: "clamp" });

  // Subtle breathing after landing
  const breathe = interpolate(
    frame,
    [24, 48, 72],
    [1, 1.03, 1],
    { extrapolateRight: "extend" }
  );

  return (
    <div
      style={{
        position: "absolute",
        top: "38%",
        left: "50%",
        transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale * breathe}) rotate(${rotate}deg)`,
        opacity,
        width: 280,
        height: 280,
      }}
    >
      {/* Glow effect */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.primary}18 0%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />
      {/* Logo SVG */}
      <img
        src={staticFile("logo-mountain-a.svg")}
        style={{
          width: "100%",
          height: "100%",
          filter: `drop-shadow(0 0 40px ${COLORS.primary}60) drop-shadow(0 0 80px ${COLORS.primary}30)`,
        }}
      />
    </div>
  );
};
