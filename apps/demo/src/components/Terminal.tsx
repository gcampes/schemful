import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, FONT_MONO, TERMINAL_LINES } from "../constants";
import { Cursor } from "./Cursor";

interface TerminalProps {
  startFrame?: number;
}

const TYPING_SPEED = 2; // chars per frame for commands
const LINE_PAUSE = 12; // frames between output lines
const COMMAND_PAUSE = 30; // frames pause after a command before output
const SECTION_PAUSE = 20; // frames pause between command groups

export const Terminal: React.FC<TerminalProps> = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);

  // Calculate which lines and how much of each is visible
  const visibleLines: Array<{
    text: string;
    type: string;
    charCount: number;
    isTyping: boolean;
  }> = [];

  let frameCounter = 0;

  for (const line of TERMINAL_LINES) {
    if (line.type === "blank") {
      if (elapsed > frameCounter) {
        visibleLines.push({
          text: "",
          type: "blank",
          charCount: 0,
          isTyping: false,
        });
        frameCounter += SECTION_PAUSE;
      }
      continue;
    }

    if (line.type === "command") {
      // Commands are typed character by character
      const typingFrames = Math.ceil(line.text.length / TYPING_SPEED);
      const charsVisible = Math.floor(
        Math.max(0, elapsed - frameCounter) * TYPING_SPEED
      );

      if (elapsed > frameCounter) {
        visibleLines.push({
          text: line.text,
          type: "command",
          charCount: Math.min(charsVisible, line.text.length),
          isTyping: charsVisible < line.text.length,
        });
      }

      frameCounter += typingFrames + COMMAND_PAUSE;
    } else {
      // Output lines appear instantly
      if (elapsed > frameCounter) {
        visibleLines.push({
          text: line.text,
          type: line.type,
          charCount: line.text.length,
          isTyping: false,
        });
      }
      frameCounter += LINE_PAUSE;
    }
  }

  return (
    <div
      style={{
        padding: 20,
        fontFamily: FONT_MONO,
        fontSize: 17,
        lineHeight: 1.8,
        height: "100%",
      }}
    >
      {visibleLines.map((line, i) => {
        if (line.type === "blank") {
          return <div key={i} style={{ height: "1.8em" }} />;
        }

        const color =
          line.type === "command"
            ? COLORS.text
            : line.type === "success"
              ? COLORS.accent
              : line.type === "info"
                ? COLORS.textMuted
                : COLORS.textMuted;

        return (
          <div key={i} style={{ color, whiteSpace: "pre" }}>
            {line.type === "command" && (
              <span style={{ color: COLORS.textSubtle }}>$ </span>
            )}
            <span>{line.text.slice(0, line.charCount)}</span>
            {line.isTyping && <Cursor />}
          </div>
        );
      })}
    </div>
  );
};
