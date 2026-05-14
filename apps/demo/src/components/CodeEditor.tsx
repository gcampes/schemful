import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONT_MONO } from "../constants";
import { Cursor } from "./Cursor";

interface CodeEditorProps {
  code: string;
  charsPerFrame?: number; // typing speed
  startFrame?: number;
}

// Simple syntax highlighter for TypeScript
function highlightLine(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  const rules: Array<{ pattern: RegExp; color: string }> = [
    // Comments
    { pattern: /^(\/\/.*)/, color: COLORS.comment },
    // Strings (single-quoted)
    { pattern: /^('[^']*')/, color: COLORS.string },
    // Keywords
    {
      pattern:
        /^(import|from|export|default|const|let|var|function|return|type|interface)\b/,
      color: COLORS.keyword,
    },
    // Types / constants (PascalCase)
    {
      pattern: /^(ContentTypeSchema|FieldType|LinkType|Mark|NodeType|MimeType)\b/,
      color: COLORS.type,
    },
    // Dot-access members
    {
      pattern:
        /^(Symbol|Text|RichText|Integer|Number|Date|Boolean|Link|Array|Entry|Asset|Bold|Italic|Code|Heading2|Heading3|Paragraph|OrderedList|UnorderedList|Blockquote|Hyperlink)\b/,
      color: COLORS.type,
    },
    // Function calls
    {
      pattern:
        /^(validators|richTextValidators|allowedMarks|allowedNodeTypes|unique|textLength|slug|linkContentType)\b/,
      color: COLORS.accent,
    },
    // Property keys (before colon)
    { pattern: /^([a-zA-Z_]\w*)(?=\s*:)/, color: COLORS.property },
    // Numbers
    { pattern: /^(\d+)/, color: COLORS.number },
    // Booleans
    { pattern: /^(true|false)\b/, color: COLORS.number },
    // Punctuation
    {
      pattern: /^([{}[\](),;:.])/, color: COLORS.punctuation,
    },
    // Everything else
    { pattern: /^(\S+)/, color: COLORS.punctuation },
    // Whitespace
    { pattern: /^(\s+)/, color: "transparent" },
  ];

  while (remaining.length > 0) {
    let matched = false;
    for (const rule of rules) {
      const match = remaining.match(rule.pattern);
      if (match) {
        tokens.push(
          <span key={key++} style={{ color: rule.color }}>
            {match[1]}
          </span>
        );
        remaining = remaining.slice(match[1].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push(
        <span key={key++} style={{ color: COLORS.punctuation }}>
          {remaining[0]}
        </span>
      );
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  charsPerFrame = 3,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const visibleChars = Math.floor(elapsed * charsPerFrame);
  const visibleCode = code.slice(0, visibleChars);
  const isTyping = visibleChars < code.length;

  const lines = visibleCode.split("\n");

  // Auto-scroll: calculate how far to shift the content up
  // so the cursor line is always visible.
  const lineHeight = 17 * 1.7; // fontSize * lineHeight
  const containerHeight = 580; // approximate visible area in the window
  const padding = 20;
  const contentHeight = lines.length * lineHeight + padding * 2;
  const maxScroll = Math.max(0, contentHeight - containerHeight);
  // Smoothly scroll as new lines appear, keeping a few lines of lookahead
  const targetScroll = Math.max(0, (lines.length * lineHeight + padding) - containerHeight + lineHeight * 2);
  const scrollY = Math.min(targetScroll, maxScroll);

  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontSize: 17,
        lineHeight: 1.7,
        color: COLORS.punctuation,
        height: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          padding: "20px 0",
          transform: `translateY(${-scrollY}px)`,
          transition: "transform 0.1s linear",
        }}
      >
        {lines.map((line, i) => (
          <div key={i} style={{ display: "flex", minHeight: "1.7em" }}>
            {/* Line number */}
            <span
              style={{
                display: "inline-block",
                width: 50,
                textAlign: "right",
                paddingRight: 16,
                color: COLORS.textSubtle,
                userSelect: "none",
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            {/* Code */}
            <span style={{ whiteSpace: "pre" }}>
              {highlightLine(line)}
              {i === lines.length - 1 && isTyping && <Cursor />}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
