import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { WindowChrome } from "./components/WindowChrome";
import { CodeEditor } from "./components/CodeEditor";
import { Terminal } from "./components/Terminal";
import { COLORS, FONT_SANS, SCHEMA_CODE, VIDEO_WIDTH, VIDEO_HEIGHT } from "./constants";

// Timing (in frames at 30fps)
const SCHEMA_START = 0;
const SCHEMA_DURATION = 240; // ~8 sec — typing + pause at end
const TRANSITION_START = SCHEMA_DURATION;
const TRANSITION_DURATION = 15; // 0.5 sec crossfade
const TERMINAL_START = TRANSITION_START + TRANSITION_DURATION;
const TERMINAL_DURATION = 270; // 9 sec — commands + hold

export const TOTAL_FRAMES =
  SCHEMA_DURATION + TRANSITION_DURATION + TERMINAL_DURATION;

export const DemoVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // Which phase are we in?
  const isTerminal = frame >= TRANSITION_START;

  // Window title changes with the transition
  const title = isTerminal ? "Terminal" : "schemas/blogPost.ts";

  // Content crossfade
  const schemaOpacity = interpolate(
    frame,
    [TRANSITION_START, TRANSITION_START + TRANSITION_DURATION],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) }
  );

  const terminalOpacity = interpolate(
    frame,
    [TRANSITION_START, TRANSITION_START + TRANSITION_DURATION],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) }
  );

  return (
    <div
      style={{
        width: VIDEO_WIDTH,
        height: VIDEO_HEIGHT,
        background: COLORS.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_SANS,
        overflow: "hidden",
        padding: 40,
      }}
    >
      <div style={{ width: "100%", height: "100%" }}>
        <WindowChrome title={title}>
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {/* Schema layer */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: schemaOpacity,
              }}
            >
              <CodeEditor
                code={SCHEMA_CODE}
                charsPerFrame={3}
                startFrame={SCHEMA_START + 10}
              />
            </div>

            {/* Terminal layer */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: terminalOpacity,
              }}
            >
              <Terminal startFrame={TERMINAL_START + 10} />
            </div>
          </div>
        </WindowChrome>
      </div>
    </div>
  );
};
