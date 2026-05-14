import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { COLORS, FONT_MONO, FONT_SANS, VIDEO_WIDTH, VIDEO_HEIGHT } from "../constants";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
  dashed?: boolean;
}

const NODES: Node[] = [
  // Center — Blog Post (appears first)
  { id: "blogPost", label: "📝 Blog Post", x: 640, y: 220 },
  // Second ring — direct references
  { id: "author", label: "👤 Author", x: 280, y: 380 },
  { id: "category", label: "📂 Category", x: 640, y: 380 },
  { id: "tag", label: "🏷️ Tag", x: 1000, y: 380 },
  // Third ring — embedded in rich text
  { id: "codeBlock", label: "💻 Code Block", x: 280, y: 530 },
  { id: "gallery", label: "📸 Gallery", x: 640, y: 530 },
  { id: "newsletter", label: "📰 Newsletter", x: 1000, y: 530 },
];

const EDGES: Edge[] = [
  // Direct references (solid)
  { from: "blogPost", to: "author" },
  { from: "blogPost", to: "category" },
  { from: "blogPost", to: "tag" },
  // Embedded in rich text (dashed)
  { from: "blogPost", to: "codeBlock", dashed: true },
  { from: "blogPost", to: "gallery", dashed: true },
  { from: "blogPost", to: "newsletter", dashed: true },
];

// Which bloom wave each node belongs to
const BLOOM_WAVE: Record<string, number> = {
  blogPost: 0,
  author: 1,
  category: 1,
  tag: 1,
  codeBlock: 2,
  gallery: 2,
  newsletter: 2,
};

const NODE_WIDTH = 170;
const NODE_HEIGHT = 44;
const BLOOM_STAGGER = 12; // frames between waves

interface ModelGraphProps {
  startFrame?: number;
}

export const ModelGraph: React.FC<ModelGraphProps> = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = Math.max(0, frame - startFrame);

  const nodeMap = new Map(NODES.map((n) => [n.id, n]));

  // Title fade in
  const titleOpacity = interpolate(elapsed, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: VIDEO_WIDTH,
        height: VIDEO_HEIGHT,
        background: COLORS.bg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_SANS,
          fontSize: 22,
          color: COLORS.textMuted,
          opacity: titleOpacity,
          fontWeight: 500,
        }}
      >
        Your content model, fully managed
      </div>

      {/* Edges SVG layer */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: VIDEO_WIDTH,
          height: VIDEO_HEIGHT,
          pointerEvents: "none",
        }}
      >
        {EDGES.map((edge, i) => {
          const from = nodeMap.get(edge.from)!;
          const to = nodeMap.get(edge.to)!;
          const toWave = BLOOM_WAVE[edge.to];

          // Edge appears after the target node's wave
          const edgeStart = (toWave + 0.5) * BLOOM_STAGGER + 10;
          const lineProgress = interpolate(
            elapsed,
            [edgeStart, edgeStart + 15],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          if (lineProgress <= 0) return null;

          const x1 = from.x;
          const y1 = from.y + NODE_HEIGHT / 2;
          const x2 = to.x;
          const y2 = to.y - NODE_HEIGHT / 2;

          const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
          const dashOffset = length * (1 - lineProgress);

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={COLORS.accent}
              strokeWidth={1.5}
              strokeOpacity={0.4}
              strokeDasharray={edge.dashed ? "6 4" : `${length}`}
              strokeDashoffset={edge.dashed ? 0 : dashOffset}
              opacity={lineProgress}
            />
          );
        })}

        {/* Category self-reference arc */}
        {(() => {
          const cat = nodeMap.get("category")!;
          const arcStart = (1 + 0.5) * BLOOM_STAGGER + 10;
          const arcProgress = interpolate(
            elapsed,
            [arcStart + 10, arcStart + 25],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          if (arcProgress <= 0) return null;

          const cx = cat.x + NODE_WIDTH / 2 + 10;
          const cy = cat.y;

          return (
            <path
              d={`M ${cx} ${cy - 10} C ${cx + 35} ${cy - 35}, ${cx + 35} ${cy + 35}, ${cx} ${cy + 10}`}
              fill="none"
              stroke={COLORS.accent}
              strokeWidth={1.5}
              strokeOpacity={0.4 * arcProgress}
              strokeDasharray="4 3"
            />
          );
        })()}
      </svg>

      {/* Nodes */}
      {NODES.map((node) => {
        const wave = BLOOM_WAVE[node.id];
        const nodeStart = wave * BLOOM_STAGGER + 5;

        const scale = spring({
          frame: elapsed - nodeStart,
          fps,
          config: {
            damping: 15,
            stiffness: 120,
            mass: 0.8,
          },
        });

        const opacity = interpolate(
          elapsed,
          [nodeStart, nodeStart + 8],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: node.x - NODE_WIDTH / 2,
              top: node.y - NODE_HEIGHT / 2,
              width: NODE_WIDTH,
              height: NODE_HEIGHT,
              background: COLORS.bgCard,
              border: `1px solid ${COLORS.accent}`,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_MONO,
              fontSize: 13,
              fontWeight: 500,
              color: COLORS.text,
              transform: `scale(${scale})`,
              opacity,
              boxShadow: `0 0 20px ${COLORS.accentMuted}`,
            }}
          >
            {node.label}
          </div>
        );
      })}
    </div>
  );
};
