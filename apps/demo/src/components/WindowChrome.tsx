import React from "react";
import { COLORS } from "../constants";

interface WindowChromeProps {
  title: string;
  active?: boolean;
  children: React.ReactNode;
}

export const WindowChrome: React.FC<WindowChromeProps> = ({
  title,
  children,
}) => {
  return (
    <div
      style={{
        background: COLORS.bgSubtle,
        borderRadius: 16,
        border: `1px solid ${COLORS.border}`,
        overflow: "hidden",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          background: COLORS.bgCard,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        {/* macOS dots */}
        <div style={{ display: "flex", gap: 6 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.6)",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "rgba(234, 179, 8, 0.6)",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "rgba(34, 197, 94, 0.6)",
            }}
          />
        </div>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: COLORS.textSubtle,
            marginLeft: 8,
          }}
        >
          {title}
        </span>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden" }}>{children}</div>
    </div>
  );
};
