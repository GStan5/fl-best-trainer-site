import React, { useState } from "react";
import { ClassRevenueMonth } from "../types";

const StackedBarChart: React.FC<{
  data: ClassRevenueMonth[];
  formatValue?: (v: number) => string;
}> = ({ data, formatValue = String }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data.length) return null;

  const maxGross = Math.max(...data.map((d) => d.gross), 1);
  const W = 280, H = 160;
  const padT = 26, padB = 28, padL = 4, padR = 4;
  const chartH = H - padT - padB;
  const step = (W - padL - padR) / data.length;
  const barW = step * 0.58;

  const hoveredItem = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="relative">
      {/* Legend */}
      <div className="flex gap-4 justify-center mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span className="text-gray-400 text-xs">Net Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-600" />
          <span className="text-gray-400 text-xs">Gym Cost (25%)</span>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredItem !== null && hoveredIdx !== null && (
        <div
          className="absolute z-10 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-xs pointer-events-none shadow-xl whitespace-nowrap"
          style={{
            left: `${((hoveredIdx + 0.5) / data.length) * 100}%`,
            top: "28px",
            transform: "translateX(-50%)",
          }}
        >
          <div className="font-semibold text-white mb-1.5">{hoveredItem.month}</div>
          <div className="text-gray-400">{hoveredItem.bookings} clients × $40</div>
          <div className="text-blue-400 mt-1">Gross: {formatValue(hoveredItem.gross)}</div>
          <div className="text-red-400">Gym cost: −{formatValue(hoveredItem.gymCost)}</div>
          <div className="text-emerald-400 font-semibold">Net: {formatValue(hoveredItem.net)}</div>
        </div>
      )}

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        onMouseLeave={() => setHoveredIdx(null)}
      >
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
          const totalH = Math.max((item.gross / maxGross) * chartH, item.gross > 0 ? 3 : 0);
          const gymH = totalH * 0.25;
          const netH = totalH * 0.75;
          const x = padL + i * step + (step - barW) / 2;
          const baseY = padT + chartH;
          const isHovered = hoveredIdx === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              style={{ cursor: "pointer" }}
            >
              {/* Hover background highlight */}
              {isHovered && (
                <rect
                  x={padL + i * step}
                  y={padT}
                  width={step}
                  height={chartH}
                  fill="white"
                  opacity="0.05"
                  rx="2"
                />
              )}
              {/* Net (green) — bottom portion */}
              {netH > 0 && (
                <rect
                  x={x}
                  y={baseY - totalH}
                  width={barW}
                  height={netH}
                  fill="#10b981"
                  rx="2"
                  opacity={isHovered ? 1 : 0.85}
                />
              )}
              {/* Gym cost (red) — top portion */}
              {gymH > 0 && (
                <rect
                  x={x}
                  y={baseY - totalH + netH}
                  width={barW}
                  height={gymH}
                  fill="#ef4444"
                  rx="0"
                  opacity={isHovered ? 1 : 0.8}
                />
              )}
              {item.gross > 0 && (
                <text
                  x={x + barW / 2}
                  y={baseY - totalH - 4}
                  textAnchor="middle"
                  fontSize="7.5"
                  fill="#e5e7eb"
                  fontWeight="600"
                >
                  {formatValue(item.net)}
                </text>
              )}
              <text
                x={x + barW / 2}
                y={H - 6}
                textAnchor="middle"
                fontSize="7"
                fill={isHovered ? "#e5e7eb" : "#6b7280"}
              >
                {item.month.slice(0, 3)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default StackedBarChart;
