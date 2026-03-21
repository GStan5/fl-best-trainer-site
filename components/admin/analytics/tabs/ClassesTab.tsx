import React from "react";
import { AnalyticsData } from "../types";
import KpiCard from "../ui/KpiCard";
import Card from "../ui/Card";
import BarChart from "../charts/BarChart";
import DonutChart from "../charts/DonutChart";
import HBar from "../charts/HBar";

const ClassesTab: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const fillDisplay = data.classes.pastFillRate > 0 ? data.classes.pastFillRate : data.classes.avgFillRate;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Classes" value={data.classes.totalClasses} gradient="bg-gradient-to-br from-blue-700 to-blue-900" icon="📋" />
        <KpiCard label="Upcoming" value={data.classes.upcomingClasses} gradient="bg-gradient-to-br from-yellow-700 to-yellow-900" icon="⏳" />
        <KpiCard label="Completed" value={data.classes.completedClasses} gradient="bg-gradient-to-br from-green-700 to-green-900" icon="✅" />
        <KpiCard label="Avg Fill Rate" value={`${fillDisplay}%`} gradient="bg-gradient-to-br from-red-700 to-red-900" icon="🎯" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Classes Scheduled Per Month">
          <BarChart
            data={data.classes.classesByMonth.map((d) => ({ label: d.month, value: d.count }))}
            color="#ef4444"
          />
        </Card>
        <Card title="Classes by Day of Week">
          <BarChart
            data={data.classes.weeklyClassSchedule.map((d) => ({ label: d.day.slice(0, 3), value: d.classes }))}
            color="#8b5cf6"
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Class Type Breakdown">
          <DonutChart
            data={data.classes.classTypeDistribution.map((d) => ({ label: d.type, value: d.count }))}
          />
        </Card>
        <Card title="Most Popular Class Times">
          <HBar
            data={data.classes.popularTimes.map((d) => ({ label: d.time, value: d.count }))}
            color="#f59e0b"
          />
        </Card>
      </div>

      {fillDisplay > 0 && (
        <Card title="Capacity Utilization">
          <div className="space-y-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Current fill rate</span>
              <span
                className={`font-bold ${
                  fillDisplay >= 80 ? "text-green-400" : fillDisplay >= 50 ? "text-yellow-400" : "text-red-400"
                }`}
              >
                {fillDisplay}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-700 ${
                  fillDisplay >= 80
                    ? "bg-gradient-to-r from-green-600 to-green-400"
                    : fillDisplay >= 50
                    ? "bg-gradient-to-r from-yellow-600 to-yellow-400"
                    : "bg-gradient-to-r from-red-700 to-red-500"
                }`}
                style={{ width: `${Math.min(fillDisplay, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <p className="text-gray-500 text-xs">{fillDisplay >= 80 ? "🔥 Near-capacity — great retention!" : ""}</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ClassesTab;
