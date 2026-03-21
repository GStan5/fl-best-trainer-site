import React from "react";
import BarChart from "./BarChart";

const LineChart: React.FC<{
  data: { label: string; value: number }[];
  color?: string;
  formatValue?: (v: number) => string;
}> = ({ data, color = "#10b981", formatValue = String }) => {
  if (data.length < 2) return <BarChart data={data} color={color} formatValue={formatValue} />;

  const max = Math.max(...data.map((d) => d.value), 1);
  const W = 280, H = 150;
  const padT = 22, padB = 28, padX = 12;
  const chartW = W - padX * 2, chartH = H - padT - padB;
  const stepX = chartW / (data.length - 1);

  const pts = data.map((d, i) => ({
    x: padX + i * stepX,
    y: padT + chartH * (1 - d.value / max),
    ...d,
  }));

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area =
    `M${pts[0].x},${padT + chartH} ` +
    pts.map((p) => `L${p.x},${p.y}`).join(" ") +
    ` L${pts[pts.length - 1].x},${padT + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0.33, 0.66, 1].map((f) => (
        <line
          key={f}
          x1={padX}
          y1={padT + chartH * (1 - f)}
          x2={W - padX}
          y2={padT + chartH * (1 - f)}
          stroke="#374151"
          strokeWidth="0.5"
          strokeDasharray="3,3"
        />
      ))}
      <path d={area} fill={color} opacity="0.12" />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill={color} stroke="#111827" strokeWidth="1.5" />
          {p.value > 0 && (
            <text x={p.x} y={p.y - 7} textAnchor="middle" fontSize="7.5" fill="#e5e7eb" fontWeight="600">
              {formatValue(p.value)}
            </text>
          )}
          <text x={p.x} y={H - 6} textAnchor="middle" fontSize="7" fill="#6b7280">
            {p.label.slice(0, 3)}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default LineChart;
