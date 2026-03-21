import React from "react";

const KpiCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  gradient: string;
  icon: string;
  trend?: number;
}> = ({ label, value, sub, gradient, icon, trend }) => (
  <div className={`${gradient} rounded-xl p-5 text-white`}>
    <div className="flex items-start justify-between">
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium opacity-75 uppercase tracking-wider mb-1">{label}</div>
        <div className="text-2xl font-bold leading-tight truncate">{value}</div>
        {sub && <div className="text-xs opacity-60 mt-0.5 truncate">{sub}</div>}
      </div>
      <span className="text-3xl opacity-50 ml-2 flex-shrink-0">{icon}</span>
    </div>
    {trend !== undefined && (
      <div className={`text-xs font-semibold mt-2 ${trend >= 0 ? "text-green-300" : "text-red-300"}`}>
        {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}% vs last month
      </div>
    )}
  </div>
);

export default KpiCard;
