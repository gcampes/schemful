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

const BLOOM_STAGGER = 12;

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
        padding: "10px 18px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: FONT_MONO,
        transform: `scale(${scale})`,
        opacity,
        boxShadow: `0 0 24px ${COLORS.accentMuted}, 0 4px 16px rgba(0,0,0,0.4)`,
        minWidth: 160,
      }}
    >
      <span style={{ fontSize: 20 }}>{data.label.split(" ")[0]}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>
          {data.label.split(" ").slice(1).join(" ")}
        </span>
        <span style={{ fontSize: 10, color: COLORS.textSubtle }}>
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

  const titleOpacity = interpolate(elapsed, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Left-to-right layout: Blog Post on left, references middle, embedded right
  const nodes: Node[] = useMemo(
    () => [
      // Column 1: Blog Post
      {
        id: "blogPost",
        type: "contentType",
        position: { x: 0, y: 180 },
        data: { label: "📝 Blog Post", fields: 22, wave: 0, startFrame },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
      // Column 2: Direct references
      {
        id: "author",
        type: "contentType",
        position: { x: 340, y: 20 },
        data: { label: "👤 Author", fields: 12, wave: 1, startFrame },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
      {
        id: "category",
        type: "contentType",
        position: { x: 340, y: 180 },
        data: { label: "📂 Category", fields: 8, wave: 1, startFrame },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
      {
        id: "tag",
        type: "contentType",
        position: { x: 340, y: 340 },
        data: { label: "🏷️ Tag", fields: 2, wave: 1, startFrame },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
      // Column 3: Embedded in rich text
      {
        id: "codeBlock",
        type: "contentType",
        position: { x: 680, y: 20 },
        data: { label: "💻 Code Block", fields: 6, wave: 2, startFrame },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
      {
        id: "gallery",
        type: "contentType",
        position: { x: 680, y: 180 },
        data: { label: "📸 Gallery", fields: 4, wave: 2, startFrame },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
      {
        id: "newsletter",
        type: "contentType",
        position: { x: 680, y: 340 },
        data: { label: "📰 Newsletter", fields: 4, wave: 2, startFrame },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
    ],
    [startFrame]
  );

  const edgeStyle = {
    stroke: COLORS.accent,
    strokeWidth: 1.5,
  };
  const dashedEdgeStyle = {
    stroke: COLORS.accent,
    strokeWidth: 1,
    strokeDasharray: "6 4",
    opacity: 0.6,
  };
  const marker = {
    type: MarkerType.ArrowClosed as const,
    color: COLORS.accent,
    width: 14,
    height: 14,
  };

  const edges: Edge[] = useMemo(
    () => [
      // Blog Post → direct references
      { id: "e-author", source: "blogPost", target: "author", animated: true, style: edgeStyle, markerEnd: marker },
      { id: "e-category", source: "blogPost", target: "category", animated: true, style: edgeStyle, markerEnd: marker },
      { id: "e-tag", source: "blogPost", target: "tag", animated: true, style: edgeStyle, markerEnd: marker },
      // Blog Post → embedded (via rich text)
      { id: "e-code", source: "blogPost", target: "codeBlock", animated: true, style: dashedEdgeStyle, markerEnd: marker },
      { id: "e-gallery", source: "blogPost", target: "gallery", animated: true, style: dashedEdgeStyle, markerEnd: marker },
      { id: "e-newsletter", source: "blogPost", target: "newsletter", animated: true, style: dashedEdgeStyle, markerEnd: marker },
      // Cross connections
      { id: "e-cat-self", source: "category", target: "category", animated: true, style: dashedEdgeStyle, markerEnd: marker },
      { id: "e-blog-self", source: "blogPost", target: "blogPost", animated: true, style: dashedEdgeStyle, markerEnd: marker, label: "related" },
    ],
    []
  );

  const edgeOpacity = interpolate(elapsed, [20, 35], [0, 1], {
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
          top: 30,
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

      {/* React Flow */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 100,
          width: VIDEO_WIDTH - 200,
          height: VIDEO_HEIGHT - 100,
        }}
      >
        <div style={{ width: "100%", height: "100%", opacity: edgeOpacity > 0 ? 1 : 0 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
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
