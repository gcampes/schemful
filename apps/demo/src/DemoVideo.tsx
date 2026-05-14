import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { WindowChrome } from "./components/WindowChrome";
import { CodeEditor } from "./components/CodeEditor";
import { Terminal } from "./components/Terminal";
import { ModelGraph } from "./components/ModelGraph";
import { COLORS, FONT_SANS, SCHEMA_CODE, VIDEO_WIDTH, VIDEO_HEIGHT } from "./constants";

// Timing (in frames at 30fps)
const SCHEMA_START = 0;
const SCHEMA_DURATION = 210; // 7 sec
const TRANSITION_1_START = SCHEMA_DURATION;
const TRANSITION_1_DURATION = 15; // 0.5 sec
const TERMINAL_START = TRANSITION_1_START + TRANSITION_1_DURATION;
const TERMINAL_DURATION = 270; // 9 sec
const TRANSITION_2_START = TERMINAL_START + TERMINAL_DURATION;
const TRANSITION_2_DURATION = 20; // 0.67 sec
const GRAPH_START = TRANSITION_2_START + TRANSITION_2_DURATION;
const GRAPH_DURATION = 150; // 5 sec hold

export const TOTAL_FRAMES =
  SCHEMA_DURATION +
  TRANSITION_1_DURATION +
  TERMINAL_DURATION +
  TRANSITION_2_DURATION +
  GRAPH_DURATION;

export const DemoVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // Phase detection
  const phase =
    frame < TRANSITION_1_START
      ? "schema"
      : frame < TERMINAL_START
        ? "transition1"
        : frame < TRANSITION_2_START
          ? "terminal"
          : frame < GRAPH_START
            ? "transition2"
            : "graph";

  // Window title
  const title =
    phase === "schema" || phase === "transition1"
      ? "schemas/blogPost.ts"
      : "Terminal";

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

  // Terminal → Graph crossfade (the whole window fades out, graph fades in)
  const windowOpacity = interpolate(
    frame,
    [TRANSITION_2_START, TRANSITION_2_START + TRANSITION_2_DURATION],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) }
  );

  const graphOpacity = interpolate(
    frame,
    [TRANSITION_2_START, TRANSITION_2_START + TRANSITION_2_DURATION],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) }
  );

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
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: 40,
          opacity: windowOpacity,
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

      {/* Model graph */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: graphOpacity,
        }}
      >
        <ModelGraph startFrame={GRAPH_START} />
      </div>
    </div>
  );
};
