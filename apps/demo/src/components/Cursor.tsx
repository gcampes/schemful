import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS } from "../constants";

interface CursorProps {
  color?: string;
}

export const Cursor: React.FC<CursorProps> = ({
  color = COLORS.accent,
}) => {
  const frame = useCurrentFrame();
  const visible = Math.floor(frame / 15) % 2 === 0; // Blink every 0.5s at 30fps

  return (
    <span
      style={{
        display: "inline-block",
        width: 2,
        height: "1.2em",
        background: visible ? color : "transparent",
        marginLeft: 1,
        verticalAlign: "text-bottom",
      }}
    />
  );
};
