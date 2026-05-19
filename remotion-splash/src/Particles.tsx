import { useCurrentFrame, useVideoConfig, interpolate, Easing, random } from "remotion";
import { useMemo } from "react";

const COLORS = {
  primary: "#00FF88",
  secondary: "#FF6B00",
};

interface Particle {
  id: number;
  angle: number;
  speed: number;
  size: number;
  delay: number;
  color: string;
  distance: number;
}

export const Particles = ({ count = 16 }: { count?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: random(i * 7) * Math.PI * 2,
      speed: 0.8 + random(i * 13) * 0.6,
      size: 4 + random(i * 19) * 8,
      delay: Math.floor(random(i * 23) * 10),
      color: random(i * 31) > 0.5 ? COLORS.primary : COLORS.secondary,
      distance: 120 + random(i * 41) * 200,
    }));
  }, [count]);

  return (
    <div
      style={{
        position: "absolute",
        top: "38%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 0,
        height: 0,
      }}
    >
      {particles.map((p) => {
        const startFrame = p.delay;
        const endFrame = startFrame + 0.8 * fps * p.speed;

        const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.quad),
        });

        const opacity = interpolate(frame, [startFrame, startFrame + 0.3 * fps, endFrame], [0, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const distance = progress * p.distance;
        const x = Math.cos(p.angle) * distance;
        const y = Math.sin(p.angle) * distance;
        const scale = 1 - progress * 0.5;

        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: p.color,
              transform: `translate(${x}px, ${y}px) scale(${scale})`,
              opacity,
              boxShadow: `0 0 ${p.size * 1.5}px ${p.color}80`,
            }}
          />
        );
      })}
    </div>
  );
};
