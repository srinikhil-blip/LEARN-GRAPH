export function SparkChart({ color = "indigo" }: { color?: string }) {
  return (
    <svg
      className={`spark-chart ${color}`}
      viewBox="0 0 180 56"
      preserveAspectRatio="none"
      aria-label="Trend chart"
    >
      <path
        className="spark-fill"
        d="M0 48 C18 45,26 30,42 35 S69 50,82 29 S108 10,120 21 S145 39,180 8 V56 H0Z"
      />
      <path
        className="spark-line"
        d="M0 48 C18 45,26 30,42 35 S69 50,82 29 S108 10,120 21 S145 39,180 8"
      />
    </svg>
  );
}
