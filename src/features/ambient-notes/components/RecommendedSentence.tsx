import React from "react";

interface RecommendedSentenceProps {
  sentence: string;
  onInsert: (sentence: string) => void;
}

export const RecommendedSentence: React.FC<RecommendedSentenceProps> = ({ sentence, onInsert }) => {
  return (
    <button
      onClick={() => onInsert(sentence)}
      style={{
        display: "inline-block",
        padding: "8px 14px",
        fontSize: 13,
        fontFamily: "var(--font)",
        color: "var(--text-secondary)",
        backgroundColor: "var(--bg-elevated)",
        border: "1px solid var(--border-light)",
        borderRadius: "var(--radius-full)",
        cursor: "pointer",
        transition: "all 0.15s ease",
        lineHeight: 1.4,
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--accent-soft)";
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.color = "var(--accent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--bg-elevated)";
        e.currentTarget.style.borderColor = "var(--border-light)";
        e.currentTarget.style.color = "var(--text-secondary)";
      }}
    >
      + {sentence}
    </button>
  );
};
