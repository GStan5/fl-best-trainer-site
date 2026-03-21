import React from "react";

const BarChart: React.FC<{
  data: { label: string; value: number }[];
  color?: string;
  formatValue?: (v: number) => string;
}> = ({ data, color = "#ef4444", formatValue = String }) => {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const W = 280, H = 150;
  const padT = 22, padB = 28, padL = 4, padR = 4;
  const chartH = H - padT - padB;
  const step = (W - padL - padR) / data.length;
  const barW = step * 0.58;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0.33, 0.66, 1].map((f) => (
        <line
          key={f}
          x1={padL}
          y1={padT + chartH * (1 - f)}
          x2={W - padR}
          y2={padT + chartH * (1 - f)}
          stroke="#374151"
          strokeWidth="0.5"
          strokeDasharray="3,3"
        />
      ))}
      {data.map((item, i) => {
        const barH = Math.max((item.value / max) * chartH, item.value > 0 ? 2 : 0);
        const x = padL + i * step + (step - barW) / 2;
        const y = padT + chartH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill={color} rx="2" opacity="0.85" />
            {item.value > 0 && (
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="7.5" fill="#e5e7eb" fontWeight="600">
                {formatValue(item.value)}
              </text>
            )}
            <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="7" fill="#6b7280">
              {item.label.slice(0, 3)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default BarChart;
