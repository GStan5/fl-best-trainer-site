import React from "react";

const COLORS = [
  "#ef4444", "#3b82f6", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
];

const DonutChart: React.FC<{
  data: { label: string; value: number }[];
}> = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return <p className="text-gray-500 text-sm text-center py-4">No data</p>;

  const cx = 65, cy = 65, r = 48, ir = 28;
  let angle = -Math.PI / 2;

  const slices = data.map((item, i) => {
    const theta = (item.value / total) * Math.PI * 2;
    const end = angle + theta;
    const cos0 = Math.cos(angle), sin0 = Math.sin(angle);
    const cos1 = Math.cos(end), sin1 = Math.sin(end);
    const d =
      `M${cx + r * cos0},${cy + r * sin0}` +
      ` A${r},${r} 0 ${theta > Math.PI ? 1 : 0},1 ${cx + r * cos1},${cy + r * sin1}` +
      ` L${cx + ir * cos1},${cy + ir * sin1}` +
      ` A${ir},${ir} 0 ${theta > Math.PI ? 1 : 0},0 ${cx + ir * cos0},${cy + ir * sin0} Z`;
    const result = {
      d,
      color: COLORS[i % COLORS.length],
      label: item.label,
      value: item.value,
      pct: Math.round((item.value / total) * 100),
    };
    angle = end;
    return result;
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 130 130" className="w-32 flex-shrink-0">
        {slices.map((s, i) => (
          <path key={i} d={s.d} fill={s.color} stroke="#111827" strokeWidth="1.5" />
        ))}
        <text x="65" y="62" textAnchor="middle" fontSize="13" fill="white" fontWeight="bold">
          {total}
        </text>
        <text x="65" y="74" textAnchor="middle" fontSize="7" fill="#9ca3af">total</text>
      </svg>
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-gray-300 flex-1 text-xs capitalize truncate">{s.label}</span>
            <span className="text-white text-xs font-bold">{s.value}</span>
            <span className="text-gray-500 text-xs">({s.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
