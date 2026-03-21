import React from "react";

const HBar: React.FC<{
  data: { label: string; value: number }[];
  color?: string;
  formatValue?: (v: number) => string;
}> = ({ data, color = "#ef4444", formatValue = String }) => {
  if (!data.length) return <p className="text-gray-500 text-sm text-center py-4">No data</p>;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2.5">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span
            className="text-gray-400 text-xs text-right flex-shrink-0 truncate"
            style={{ width: 52 }}
            title={item.label}
          >
            {item.label}
          </span>
          <div className="flex-1 bg-gray-700 rounded-full h-5 relative overflow-hidden">
            <div
              className="h-5 rounded-full flex items-center justify-end pr-2 transition-all duration-700"
              style={{
                width: `${Math.max((item.value / max) * 100, item.value > 0 ? 8 : 0)}%`,
                backgroundColor: color,
                opacity: Math.max(0.95 - i * 0.06, 0.5),
              }}
            >
              {item.value > 0 && (
                <span className="text-white text-xs font-bold leading-none">
                  {formatValue(item.value)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HBar;
