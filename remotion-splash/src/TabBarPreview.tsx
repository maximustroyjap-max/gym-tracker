import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

const COLORS = {
  background: "#0F0F0F",
  card: "#1A1A1A",
  primary: "#00FF88",
  textSecondary: "#9CA3AF",
};

const SCREEN_W = 1080;
const TAB_H = 80;
const BUBBLE_R = 30;
const BAR_TOP_Y = 72;
const TOTAL_H = BAR_TOP_Y + TAB_H; // 152
const CORNER_R = 20;
const NOTCH_DEPTH = 32;
const NOTCH_HALF_W = BUBBLE_R + 10; // 40
const CIRCLE_CY = BAR_TOP_Y + NOTCH_DEPTH - BUBBLE_R; // 74

const TAB_W = SCREEN_W / 5;
const TAB_POSITIONS = Array.from({ length: 5 }, (_, i) => TAB_W * (i + 0.5));

function generateBarPath(cx: number): string {
  const leftNotch = cx - NOTCH_HALF_W;
  const rightNotch = cx + NOTCH_HALF_W;
  return [
    `M 0,${BAR_TOP_Y + TAB_H}`,
    `L 0,${BAR_TOP_Y + CORNER_R}`,
    `Q 0,${BAR_TOP_Y} ${CORNER_R},${BAR_TOP_Y}`,
    `L ${leftNotch},${BAR_TOP_Y}`,
    `A ${NOTCH_HALF_W},${NOTCH_DEPTH} 0 0,1 ${rightNotch},${BAR_TOP_Y}`,
    `L ${SCREEN_W - CORNER_R},${BAR_TOP_Y}`,
    `Q ${SCREEN_W},${BAR_TOP_Y} ${SCREEN_W},${BAR_TOP_Y + CORNER_R}`,
    `L ${SCREEN_W},${BAR_TOP_Y + TAB_H}`,
    `Z`,
  ].join(' ');
}

const ICONS = ['house.fill', 'list.bullet', 'dumbbell.fill', 'clock.fill', 'person.fill'];

export const TabBarPreview = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cycleDuration = 1.2 * fps;
  const tabIndex = Math.floor(frame / cycleDuration) % 5;
  const nextTabIndex = (tabIndex + 1) % 5;
  const progress = (frame % cycleDuration) / cycleDuration;

  // Eased progress for smoother motion
  const eased = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cx = interpolate(
    eased,
    [0, 1],
    [TAB_POSITIONS[tabIndex], TAB_POSITIONS[nextTabIndex]]
  );

  const barPath = generateBarPath(cx);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        bottom: 180,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 700,
        height: 500,
        borderRadius: '50%',
        background: `radial-gradient(ellipse, ${COLORS.primary}12 0%, transparent 70%)`,
        filter: 'blur(50px)',
      }} />

      {/* Tab bar wrapper */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: SCREEN_W,
        height: TOTAL_H,
      }}>
        <svg
          width={SCREEN_W}
          height={TOTAL_H}
          viewBox={`0 0 ${SCREEN_W} ${TOTAL_H}`}
          style={{ position: 'absolute', bottom: 0 }}>
          {/* Bubble behind bar */}
          <circle
            cx={cx}
            cy={CIRCLE_CY}
            r={BUBBLE_R}
            fill={COLORS.card}
            stroke={COLORS.primary + '45'}
            strokeWidth={2}
          />
          {/* Bar with notch */}
          <path d={barPath} fill={COLORS.card} />
        </svg>

        {/* Active icon */}
        <div style={{
          position: 'absolute',
          left: cx - BUBBLE_R,
          top: CIRCLE_CY - BUBBLE_R,
          width: BUBBLE_R * 2,
          height: BUBBLE_R * 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon name={ICONS[nextTabIndex]} color={COLORS.primary} size={24} />
        </div>

        {/* Inactive icons */}
        {TAB_POSITIONS.map((x, i) => {
          if (i === nextTabIndex) return null;
          return (
            <div key={i} style={{
              position: 'absolute',
              left: x - TAB_W / 2,
              top: BAR_TOP_Y + (TAB_H - 44) / 2,
              width: TAB_W,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.45,
            }}>
              <Icon name={ICONS[i]} color={COLORS.textSecondary} size={22} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

function Icon({ name, color, size }: { name: string; color: string; size: number }) {
  const icons: Record<string, React.ReactNode> = {
    'house.fill': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
      </svg>
    ),
    'list.bullet': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
    'dumbbell.fill': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M6 5c-.55 0-1 .45-1 1v4H3V6c0-1.66 1.34-3 3-3h2v2H6zm14 0c.55 0 1 .45 1 1v4h2V6c0-1.66-1.34-3-3-3h-2v2h2zM6 19c-.55 0-1-.45-1-1v-4H3v4c0 1.66 1.34 3 3 3h2v-2H6zm14 0c.55 0 1-.45 1-1v-4h-2v4c0 1.66-1.34 3-3 3h-2v-2h2zM9 8h6v8H9V8z" />
      </svg>
    ),
    'clock.fill': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" />
      </svg>
    ),
    'person.fill': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  };
  return icons[name] || null;
}
