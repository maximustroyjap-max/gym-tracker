import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { LogoDrop } from "./LogoDrop";
import { Particles } from "./Particles";
import { Shockwave } from "./Shockwave";
import { TextReveal } from "./TextReveal";

// Theme colors
const COLORS = {
  background: "#0F0F0F",
  primary: "#00FF88",
  text: "#FFFFFF",
  textSecondary: "#9CA3AF",
};

export const SplashScreen = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background subtle pulse
  const bgOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit animation
  const exitStart = 3.2 * fps;
  const exitProgress = interpolate(frame, [exitStart, exitStart + 0.6 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });
  const exitScale = 1 - exitProgress * 0.15;
  const exitOpacity = 1 - exitProgress;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        opacity: bgOpacity,
      }}
    >
      <AbsoluteFill
        style={{
          transform: `scale(${exitScale})`,
          opacity: exitOpacity,
        }}
      >
        {/* Ambient glow behind logo */}
        <AmbientGlow />

        {/* Logo drops at 0.2s (12 frames) */}
        <Sequence from={12}>
          <LogoDrop />
        </Sequence>

        {/* Shockwave at impact 0.6s (36 frames) */}
        <Sequence from={36} durationInFrames={48}>
          <Shockwave />
        </Sequence>

        {/* Particles burst 0.8s (48 frames) */}
        <Sequence from={48} durationInFrames={60}>
          <Particles count={16} />
        </Sequence>

        {/* Text "ASCEND" 1.2s (72 frames) */}
        <Sequence from={72} durationInFrames={120} layout="none">
          <TextReveal
            text="ASCENT"
            fontSize={96}
            color={COLORS.text}
            staggerDelay={4}
            yOffset={60}
          />
        </Sequence>

        {/* Tagline 2.4s (144 frames) */}
        <Sequence from={144} durationInFrames={60} layout="none">
          <Tagline />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const AmbientGlow = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulse = interpolate(
    frame,
    [0, 2 * fps, 4 * fps],
    [0.03, 0.08, 0.03],
    { extrapolateRight: "extend" }
  );

  return (
    <div
      style={{
        position: "absolute",
        top: "35%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 500,
        height: 500,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${COLORS.primary}${Math.round(pulse * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
      }}
    />
  );
};

const Tagline = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 0.4 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const translateY = interpolate(frame, [0, 0.4 * fps], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "62%",
        left: "50%",
        transform: `translate(-50%, 0) translateY(${translateY}px)`,
        opacity,
        color: COLORS.textSecondary,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 28,
        fontWeight: 500,
        letterSpacing: 4,
        textTransform: "uppercase",
        textAlign: "center",
      }}
    >
      Rise to the Challenge
    </div>
  );
};
