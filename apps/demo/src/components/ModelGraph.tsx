import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONT_MONO, FONT_SANS, VIDEO_WIDTH, VIDEO_HEIGHT } from "../constants";

// Bloom wave assignment
const WAVE: Record<string, number> = {
  blogPost: 0,
  author: 1,
  category: 1,
  tag: 1,
  codeBlock: 2,
  gallery: 2,
  newsletter: 2,
};

const BLOOM_STAGGER = 12; // frames between waves

// Custom node component
function ContentTypeNode({ data }: { data: { label: string; fields: number; wave: number; startFrame: number } }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = Math.max(0, frame - data.startFrame);
  const nodeStart = data.wave * BLOOM_STAGGER + 5;

  const scale = spring({
    frame: elapsed - nodeStart,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.8 },
  });

  const opacity = interpolate(
    elapsed,
    [nodeStart, nodeStart + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        background: COLORS.bgCard,
        border: `1.5px solid ${COLORS.accent}`,
        borderRadius: 12,
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontFamily: FONT_MONO,
        transform: `scale(${scale})`,
        opacity,
        boxShadow: `0 0 30px ${COLORS.accentMuted}, 0 4px 20px rgba(0,0,0,0.4)`,
        minWidth: 180,
      }}
    >
      <span style={{ fontSize: 22 }}>{data.label.split(" ")[0]}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>
          {data.label.split(" ").slice(1).join(" ")}
        </span>
        <span style={{ fontSize: 11, color: COLORS.textSubtle }}>
          {data.fields} fields
        </span>
      </div>
    </div>
  );
}

const nodeTypes = { contentType: ContentTypeNode };

interface ModelGraphProps {
  startFrame?: number;
}

export const ModelGraph: React.FC<ModelGraphProps> = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);

  // Title
  const titleOpacity = interpolate(elapsed, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const nodes: Node[] = useMemo(
    () => [
      {
        id: "blogPost",
        type: "contentType",
        position: { x: 460, y: 20 },
        data: { label: "📝 Blog Post", fields: 22, wave: 0, startFrame },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      },
      {
        id: "author",
        type: "contentType",
        position: { x: 100, y: 200 },
        data: { label: "👤 Author", fields: 12, wave: 1, startFrame },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      },
      {
        id: "category",
        type: "contentType",
        position: { x: 460, y: 200 },
        data: { label: "📂 Category", fields: 8, wave: 1, startFrame },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      },
      {
        id: "tag",
        type: "contentType",
        position: { x: 820, y: 200 },
        data: { label: "🏷️ Tag", fields: 2, wave: 1, startFrame },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      },
      {
        id: "codeBlock",
        type: "contentType",
        position: { x: 100, y: 400 },
        data: { label: "💻 Code Block", fields: 6, wave: 2, startFrame },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      },
      {
        id: "gallery",
        type: "contentType",
        position: { x: 460, y: 400 },
        data: { label: "📸 Gallery", fields: 4, wave: 2, startFrame },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      },
      {
        id: "newsletter",
        type: "contentType",
        position: { x: 820, y: 400 },
        data: { label: "📰 Newsletter", fields: 4, wave: 2, startFrame },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      },
    ],
    [startFrame]
  );

  const edges: Edge[] = useMemo(
    () => [
      {
        id: "e-author",
        source: "blogPost",
        target: "author",
        animated: true,
        style: { stroke: COLORS.accent, strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.accent, width: 16, height: 16 },
      },
      {
        id: "e-category",
        source: "blogPost",
        target: "category",
        animated: true,
        style: { stroke: COLORS.accent, strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.accent, width: 16, height: 16 },
      },
      {
        id: "e-tag",
        source: "blogPost",
        target: "tag",
        animated: true,
        style: { stroke: COLORS.accent, strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.accent, width: 16, height: 16 },
      },
      {
        id: "e-code",
        source: "blogPost",
        target: "codeBlock",
        animated: true,
        style: { stroke: COLORS.accent, strokeWidth: 1, strokeDasharray: "6 4", opacity: 0.6 },
        markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.accent, width: 14, height: 14 },
      },
      {
        id: "e-gallery",
        source: "blogPost",
        target: "gallery",
        animated: true,
        style: { stroke: COLORS.accent, strokeWidth: 1, strokeDasharray: "6 4", opacity: 0.6 },
        markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.accent, width: 14, height: 14 },
      },
      {
        id: "e-newsletter",
        source: "blogPost",
        target: "newsletter",
        animated: true,
        style: { stroke: COLORS.accent, strokeWidth: 1, strokeDasharray: "6 4", opacity: 0.6 },
        markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.accent, width: 14, height: 14 },
      },
    ],
    []
  );

  // Edge visibility — fade in after nodes
  const edgeOpacity = interpolate(elapsed, [25, 40], [0, 1], {
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
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_SANS,
          fontSize: 24,
          color: COLORS.textMuted,
          opacity: titleOpacity,
          fontWeight: 500,
          zIndex: 10,
        }}
      >
        Your content model, fully managed
      </div>

      {/* React Flow graph */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 80,
          width: VIDEO_WIDTH - 160,
          height: VIDEO_HEIGHT - 120,
        }}
      >
        <div style={{ width: "100%", height: "100%", opacity: edgeOpacity > 0 ? 1 : 0 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
            style={{ background: "transparent" }}
          >
            <Background gap={40} size={1} color="rgba(34, 197, 94, 0.04)" />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};
