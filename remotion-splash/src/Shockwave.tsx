import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

const COLORS = {
  primary: "#00FF88",
};

export const Shockwave = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(frame, [0, 0.6 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const scale = 1 + progress * 2.5;
  const opacity = (1 - progress) * 0.4;
  const borderWidth = 4 * (1 - progress * 0.5);

  return (
    <div
      style={{
        position: "absolute",
        top: "38%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        width: 200,
        height: 200,
        borderRadius: "50%",
        border: `${borderWidth}px solid ${COLORS.primary}`,
        boxShadow: `0 0 20px ${COLORS.primary}40`,
      }}
    />
  );
};
