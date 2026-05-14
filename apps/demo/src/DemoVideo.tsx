import React from "react";
import { useCurrentFrame, interpolate, Easing, spring, useVideoConfig } from "remotion";
import { WindowChrome } from "./components/WindowChrome";
import { CodeEditor } from "./components/CodeEditor";
import { Terminal } from "./components/Terminal";
import { COLORS, FONT_MONO, FONT_SANS, SCHEMA_CODE, VIDEO_WIDTH, VIDEO_HEIGHT } from "./constants";

// Timing (in frames at 30fps)
const SCHEMA_START = 0;
const SCHEMA_DURATION = 210; // 7 sec
const TRANSITION_1_START = SCHEMA_DURATION;
const TRANSITION_1_DURATION = 15; // 0.5 sec
const TERMINAL_START = TRANSITION_1_START + TRANSITION_1_DURATION;
const TERMINAL_DURATION = 270; // 9 sec
const DONE_START = TERMINAL_START + TERMINAL_DURATION;
const DONE_DURATION = 90; // 3 sec

export const TOTAL_FRAMES =
  SCHEMA_DURATION +
  TRANSITION_1_DURATION +
  TERMINAL_DURATION +
  DONE_DURATION;

export const DemoVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Window title
  const isTerminal = frame >= TRANSITION_1_START;
  const title = isTerminal ? "Terminal" : "schemas/blogPost.ts";

  // Schema → Terminal crossfade
  const schemaOpacity = interpolate(
    frame,
    [TRANSITION_1_START, TRANSITION_1_START + TRANSITION_1_DURATION],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) }
  );

  const terminalOpacity = interpolate(
    frame,
    [TRANSITION_1_START, TRANSITION_1_START + TRANSITION_1_DURATION],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) }
  );

  // Done scene — fade in over the window
  const doneOpacity = interpolate(
    frame,
    [DONE_START, DONE_START + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const doneScale = spring({
    frame: Math.max(0, frame - DONE_START),
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.6 },
  });

  return (
    <div
      style={{
        width: VIDEO_WIDTH,
        height: VIDEO_HEIGHT,
        background: COLORS.bg,
        fontFamily: FONT_SANS,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Window (schema + terminal) */}
      <div style={{ position: "absolute", inset: 0, padding: 40 }}>
        <div style={{ width: "100%", height: "100%" }}>
          <WindowChrome title={title}>
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <div style={{ position: "absolute", inset: 0, opacity: schemaOpacity }}>
                <CodeEditor
                  code={SCHEMA_CODE}
                  charsPerFrame={3}
                  startFrame={SCHEMA_START + 10}
                />
              </div>
              <div style={{ position: "absolute", inset: 0, opacity: terminalOpacity }}>
                <Terminal startFrame={TERMINAL_START + 10} />
              </div>
            </div>
          </WindowChrome>
        </div>
      </div>

      {/* Done overlay */}
      {frame >= DONE_START && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: COLORS.bg,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: doneOpacity,
            gap: 20,
          }}
        >
          <div style={{ fontSize: 72, transform: `scale(${doneScale})` }}>
            ✅
          </div>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: 28,
              fontWeight: 600,
              color: COLORS.text,
              transform: `scale(${doneScale})`,
            }}
          >
            Your content model is live
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 15,
              color: COLORS.textSubtle,
              transform: `scale(${doneScale})`,
              marginTop: 8,
              padding: "8px 20px",
              background: COLORS.bgCard,
              borderRadius: 10,
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
