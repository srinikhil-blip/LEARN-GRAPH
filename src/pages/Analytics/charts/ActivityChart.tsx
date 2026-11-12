import type { ActivityDataPoint } from "@/types/analytics";

export function ActivityChart({ data }: { data: ActivityDataPoint[] }) {
  return (
    <div className="main-chart">
      <div className="y-labels">
        <span>10h</span>
        <span>7.5h</span>
        <span>5h</span>
        <span>2.5h</span>
        <span>0</span>
      </div>
      <svg viewBox="0 0 700 250" preserveAspectRatio="none" aria-label="Focus time and accuracy graph">
        {[30, 80, 130, 180, 230].map((y) => (
          <line key={y} x1="0" y1={y} x2="700" y2={y} />
        ))}
        <path
          className="area"
          d="M0 205 C70 190 110 115 170 142 S270 190 330 103 S440 68 500 98 S610 80 700 35 V250 H0Z"
        />
        <path
          className="line"
          d="M0 205 C70 190 110 115 170 142 S270 190 330 103 S440 68 500 98 S610 80 700 35"
        />
        {[0, 116, 233, 350, 466, 583, 700].map((x, i) => (
          <rect
            key={x}
            x={x - 10}
            y={230 - [75, 110, 65, 150, 125, 180, 160][i]}
            width="20"
            height={[75, 110, 65, 150, 125, 180, 160][i]}
            rx="5"
          />
        ))}
      </svg>
      <div className="x-labels">
        {data.map((x) => (
          <span key={x.date}>{x.date}</span>
        ))}
      </div>
    </div>
  );
}
