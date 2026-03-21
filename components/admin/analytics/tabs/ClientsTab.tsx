import React from "react";
import { AnalyticsData } from "../types";
import { fmtPct } from "../utils";
import KpiCard from "../ui/KpiCard";
import Card from "../ui/Card";
import BarChart from "../charts/BarChart";
import HBar from "../charts/HBar";

const ClientsTab: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const engagementRate =
    data.clients.totalUsers > 0
      ? Math.round((data.clients.activeUsers / data.clients.totalUsers) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Clients" value={data.clients.totalUsers} gradient="bg-gradient-to-br from-blue-700 to-blue-900" icon="👥" />
        <KpiCard label="Active (30d)" value={data.clients.activeUsers} gradient="bg-gradient-to-br from-green-700 to-green-900" icon="⚡" />
        <KpiCard label="New This Month" value={data.clients.newUsersThisMonth} gradient="bg-gradient-to-br from-purple-700 to-purple-900" icon="🆕" />
        <KpiCard
          label="Growth Rate"
          value={fmtPct(data.clients.userGrowthRate)}
          gradient={
            data.clients.userGrowthRate >= 0
              ? "bg-gradient-to-br from-emerald-700 to-emerald-900"
              : "bg-gradient-to-br from-red-700 to-red-900"
          }
          icon="📈"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="New Clients Per Month">
          <BarChart
            data={data.clients.usersByMonth.map((d) => ({ label: d.month, value: d.count }))}
            color="#3b82f6"
          />
        </Card>
        <Card title="Bookings by Day of Week">
          <HBar
            data={data.clients.bookingPatterns
              .filter((d) => d.bookings > 0)
              .map((d) => ({ label: d.day.slice(0, 3), value: d.bookings }))}
            color="#8b5cf6"
          />
        </Card>
      </div>

      {data.clients.topClients.length > 0 && (
        <Card title="Top Clients by Attendance">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase border-b border-gray-700">
                  <th className="pb-2 text-left w-6">#</th>
                  <th className="pb-2 text-left">Client</th>
                  <th className="pb-2 text-right">Classes</th>
                  <th className="pb-2 text-right hidden sm:table-cell">Last Class</th>
                </tr>
              </thead>
              <tbody>
                {data.clients.topClients.map((c, i) => (
                  <tr key={i} className="border-b border-gray-800 transition-colors">
                    <td className="py-3 text-gray-600 font-mono text-xs">{i + 1}</td>
                    <td className="py-3">
                      <div className="font-medium text-white">{c.name}</div>
                      <div className="text-gray-500 text-xs">{c.email}</div>
                    </td>
                    <td className="py-3 text-right">
                      <span className="bg-red-900/50 text-red-300 px-2 py-0.5 rounded-full font-bold text-xs">
                        {c.bookings}
                      </span>
                    </td>
                    <td className="py-3 text-right text-gray-500 text-xs hidden sm:table-cell">
                      {c.lastClassDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-1">{engagementRate}%</div>
          <div className="text-gray-400 text-sm">Engagement Rate</div>
          <div className="text-gray-600 text-xs mt-1">Active last 30 days</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-green-400 mb-1">
            {data.clients.totalUsers > 0
              ? (
                  data.clients.bookingPatterns.reduce((s, p) => s + p.bookings, 0) /
                  data.clients.totalUsers
                ).toFixed(1)
              : 0}
          </div>
          <div className="text-gray-400 text-sm">Avg Bookings / Client</div>
          <div className="text-gray-600 text-xs mt-1">All time</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 text-center">
          <div
            className={`text-3xl font-bold mb-1 ${
              data.clients.userGrowthRate >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {fmtPct(data.clients.userGrowthRate)}
          </div>
          <div className="text-gray-400 text-sm">Monthly Growth</div>
          <div className="text-gray-600 text-xs mt-1">New clients vs last month</div>
        </div>
      </div>
    </div>
  );
};

export default ClientsTab;
