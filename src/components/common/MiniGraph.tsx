export function MiniGraph() {
  return (
    <svg className="mini-graph" viewBox="0 0 560 240" aria-label="Knowledge pulse graph">
      {[
        [275, 120, 115, 65],
        [275, 120, 160, 185],
        [275, 120, 405, 55],
        [275, 120, 440, 170],
        [115, 65, 75, 150],
        [160, 185, 75, 150],
        [405, 55, 500, 105],
        [440, 170, 500, 105],
      ].map((l, i) => (
        <line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} />
      ))}
      {[
        [275, 120, 38, "AI"],
        [115, 65, 27, "Algebra"],
        [160, 185, 29, "Functions"],
        [405, 55, 29, "Limits"],
        [440, 170, 29, "Vectors"],
        [75, 150, 23, "Trig"],
        [500, 105, 23, "Calc"],
      ].map((n, i) => (
        <g key={i} className={`mg n${i}`}>
          <circle cx={n[0] as number} cy={n[1] as number} r={n[2] as number} />
          <text x={n[0] as number} y={(n[1] as number) + 4}>
            {n[3]}
          </text>
        </g>
      ))}
    </svg>
  );
}
