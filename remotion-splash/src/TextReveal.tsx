import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

interface TextRevealProps {
  text: string;
  fontSize: number;
  color: string;
  staggerDelay?: number;
  yOffset?: number;
}

export const TextReveal = ({
  text,
  fontSize,
  color,
  staggerDelay = 4,
  yOffset = 60,
}: TextRevealProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const characters = text.split("");

  return (
    <div
      style={{
        position: "absolute",
        top: "55%",
        left: "50%",
        transform: "translate(-50%, 0)",
        display: "flex",
        gap: 8,
      }}
    >
      {characters.map((char, i) => {
        const delay = i * staggerDelay;
        const charFrame = frame - delay;

        const charProgress = spring({
          frame: charFrame,
          fps,
          config: {
            damping: 14,
            stiffness: 200,
            mass: 0.8,
          },
        });

        const translateY = interpolate(charProgress, [0, 1], [yOffset, 0]);
        const opacity = interpolate(charFrame, [0, 6], [0, 1], {
          extrapolateLeft: "clamp",
        });
        const scale = interpolate(charProgress, [0, 1], [0.5, 1]);

        // Slight rotation for playful feel
        const rotate = interpolate(charProgress, [0, 0.5, 1], [-8, 3, 0]);

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
              opacity,
              color,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize,
              fontWeight: 900,
              letterSpacing: 2,
              lineHeight: 1,
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};
