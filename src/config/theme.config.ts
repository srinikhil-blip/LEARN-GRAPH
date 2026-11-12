export const THEME_CONFIG = {
  colors: {
    primary: "#4f46e5",
    primaryDark: "#4338ca",
    cyan: "#06b6d4",
    emerald: "#10b981",
    amber: "#f59e0b",
    red: "#ef4444",
    ink: "#0f172a",
    muted: "#64748b",
    line: "#e2e8f0",
    surface: "#ffffff",
    bg: "#f8fafc",
    soft: "#f1f5f9",
  },
  nodeStatusColors: {
    mastered: "#10b981", // Green
    learning: "#f59e0b", // Yellow/Amber
    weak: "#ef4444",     // Red
    upcoming: "#3b82f6", // Blue / Recommended
  },
} as const;
