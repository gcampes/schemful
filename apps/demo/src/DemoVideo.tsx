import React from "react";
import {
  useCurrentFrame,
  interpolate,
  Easing,
  spring,
  useVideoConfig,
} from "remotion";
import { WindowChrome } from "./components/WindowChrome";
import { CodeEditor } from "./components/CodeEditor";
import { Terminal } from "./components/Terminal";
import {
  COLORS,
  FONT_MONO,
  FONT_SANS,
  SCHEMA_CODE,
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
} from "./constants";

// Timing (in frames at 30fps)
const SCHEMA_START = 0;
const SCHEMA_DURATION = 240; // 8 sec — code typing
const TRANSITION_START = SCHEMA_DURATION; // frame 240
const TRANSITION_DURATION = 20; // ~0.67 sec
const TERMINAL_START = TRANSITION_START + TRANSITION_DURATION; // frame 260
const TERMINAL_DURATION = 270; // 9 sec — commands
const OUTRO_START = TERMINAL_START + TERMINAL_DURATION; // frame 530
const OUTRO_DURATION = 60; // 2 sec

export const TOTAL_FRAMES =
  SCHEMA_DURATION + TRANSITION_DURATION + TERMINAL_DURATION + OUTRO_DURATION;

export const DemoVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Tab indicator position
  const activeTab =
    frame < TRANSITION_START ? "schema" : "terminal";

  // Transition: slide the content panels
  const slideX = interpolate(
    frame,
    [TRANSITION_START, TRANSITION_START + TRANSITION_DURATION],
    [0, -VIDEO_WIDTH],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    }
  );

  // Outro fade
  const outroOpacity = interpolate(
    frame,
    [OUTRO_START + 20, OUTRO_START + OUTRO_DURATION],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        width: VIDEO_WIDTH,
        height: VIDEO_HEIGHT,
        background: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT_SANS,
        overflow: "hidden",
        padding: 32,
      }}
    >
      {/* Header with logo + tabs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: FONT_MONO,
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          <span style={{ color: COLORS.accent }}>&gt;</span>
          <span style={{ color: COLORS.text }}>ct</span>
          <span
            style={{
              color: COLORS.textSubtle,
              fontSize: 13,
              fontWeight: 400,
              marginLeft: 12,
            }}
          >
            Content Type Kit
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          <TabButton
            label="📄 Schema"
            active={activeTab === "schema"}
          />
          <TabButton
            label="⬛ Terminal"
            active={activeTab === "terminal"}
          />
        </div>
      </div>

      {/* Sliding content area */}
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          borderRadius: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            width: VIDEO_WIDTH * 2,
            height: "100%",
            transform: `translateX(${slideX}px)`,
          }}
        >
          {/* Schema panel */}
          <div
            style={{
              width: VIDEO_WIDTH - 64,
              height: "100%",
              flexShrink: 0,
            }}
          >
            <WindowChrome title="schemas/blogPost.ts">
              <CodeEditor
                code={SCHEMA_CODE}
                charsPerFrame={3}
                startFrame={SCHEMA_START + 15}
              />
            </WindowChrome>
          </div>

          {/* Terminal panel */}
          <div
            style={{
              width: VIDEO_WIDTH - 64,
              height: "100%",
              flexShrink: 0,
            }}
          >
            <WindowChrome title="Terminal">
              <Terminal startFrame={TERMINAL_START + 15} />
            </WindowChrome>
          </div>
        </div>
      </div>

      {/* Outro overlay */}
      {frame >= OUTRO_START && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT,
            background: COLORS.bg,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: outroOpacity,
            gap: 16,
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 40,
              fontWeight: 700,
              display: "flex",
              gap: 4,
            }}
          >
            <span style={{ color: COLORS.accent }}>&gt;</span>
            <span style={{ color: COLORS.text }}>ctkit</span>
          </div>
          <div
            style={{
              fontSize: 18,
              color: COLORS.textMuted,
            }}
          >
            Schema-as-code for Contentful
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 14,
              color: COLORS.textSubtle,
              marginTop: 8,
              padding: "8px 16px",
              background: COLORS.bgCard,
              borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            npm install -g @ctkit/cli
          </div>
        </div>
      )}
    </div>
  );
};

// Tab button component
const TabButton: React.FC<{ label: string; active: boolean }> = ({
  label,
  active,
}) => (
  <div
    style={{
      padding: "6px 14px",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 500,
      color: active ? COLORS.text : COLORS.textSubtle,
      background: active ? COLORS.bgCard : "transparent",
      border: active ? `1px solid ${COLORS.border}` : "1px solid transparent",
    }}
  >
    {label}
  </div>
);
