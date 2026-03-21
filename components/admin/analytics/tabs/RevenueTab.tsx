import React from "react";
import { AnalyticsData } from "../types";
import { fmt$ } from "../utils";
import KpiCard from "../ui/KpiCard";
import Card from "../ui/Card";
import StackedBarChart from "../charts/StackedBarChart";
import HBar from "../charts/HBar";

const RevenueTab: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const bestRevMonth =
    data.revenue.classRevenueByMonth.length > 0
      ? data.revenue.classRevenueByMonth.reduce((a, b) => (a.net > b.net ? a : b))
      : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">
          Class Revenue — $40/person · 25% gym cost
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            label="Total Gross Revenue"
            value={fmt$(data.revenue.classGross)}
            sub={`${data.revenue.completedBookings} completed class bookings`}
            gradient="bg-gradient-to-br from-blue-700 to-blue-900"
            icon="📋"
          />
          <KpiCard
            label="Gym Cost (25%)"
            value={fmt$(data.revenue.classGymCost)}
            sub={`${fmt$(data.revenue.monthlyClassGymCost)} this month`}
            gradient="bg-gradient-to-br from-red-800 to-red-950"
            icon="🏛️"
          />
          <KpiCard
            label="Net Revenue (75%)"
            value={fmt$(data.revenue.classNet)}
            sub={`${fmt$(data.revenue.monthlyClassNet)} this month`}
            gradient="bg-gradient-to-br from-emerald-700 to-emerald-900"
            icon="💰"
            trend={data.revenue.classRevenueGrowth}
          />
        </div>
      </div>

      {/* This month breakdown */}
      <div className="bg-gray-800 rounded-xl p-5">
        <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">
          This Month Breakdown
        </h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase mb-1">Gross</div>
            <div className="text-xl font-bold text-blue-400">{fmt$(data.revenue.monthlyClassGross)}</div>
            <div className="text-gray-600 text-xs mt-1">
              ({data.revenue.classRevenueByMonth.at(-1)?.bookings ?? 0} clients × $40)
            </div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase mb-1">Gym Cost</div>
            <div className="text-xl font-bold text-red-400">−{fmt$(data.revenue.monthlyClassGymCost)}</div>
            <div className="text-gray-600 text-xs mt-1">(25% of gross)</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase mb-1">Net</div>
            <div className="text-xl font-bold text-emerald-400">{fmt$(data.revenue.monthlyClassNet)}</div>
            <div className="text-gray-600 text-xs mt-1">(75% of gross)</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex rounded-full overflow-hidden h-4 bg-gray-700">
            <div className="bg-emerald-500 h-4 flex items-center justify-center" style={{ width: "75%" }}>
              <span className="text-white text-xs font-bold">75%</span>
            </div>
            <div className="bg-red-600 h-4 flex items-center justify-center" style={{ width: "25%" }}>
              <span className="text-white text-xs font-bold">25%</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Your net</span>
            <span>Gym cost</span>
          </div>
        </div>
      </div>

      <Card title="Monthly Profit Breakdown — Net vs Gym Cost (last 6 months)">
        <StackedBarChart data={data.revenue.classRevenueByMonth} formatValue={fmt$} />
      </Card>

      {(data.revenue.packageBreakdown ?? []).length > 0 && (
        <Card title="Package Sales Breakdown">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase border-b border-gray-700">
                  <th className="pb-2 text-left">Package</th>
                  <th className="pb-2 text-right">Price</th>
                  <th className="pb-2 text-right hidden sm:table-cell">Sessions</th>
                  <th className="pb-2 text-right">Sold</th>
                  <th className="pb-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.revenue.packageBreakdown.map((p, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="py-3 font-medium text-white">{p.name}</td>
                    <td className="py-3 text-right text-gray-300">{fmt$(p.price)}</td>
                    <td className="py-3 text-right text-gray-400 hidden sm:table-cell">{p.sessionsIncluded}</td>
                    <td className="py-3 text-right">
                      <span className="bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full text-xs font-bold">
                        {p.sold}
                      </span>
                    </td>
                    <td className="py-3 text-right text-emerald-400 font-semibold">{fmt$(p.revenue)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-600">
                  <td className="pt-3 font-bold text-white" colSpan={3}>Total</td>
                  <td className="pt-3 text-right font-bold text-white">
                    {data.revenue.packageBreakdown.reduce((s, p) => s + p.sold, 0)}
                  </td>
                  <td className="pt-3 text-right font-bold text-emerald-400">
                    {fmt$(data.revenue.totalRevenue)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {data.revenue.packageBreakdown.some((p) => p.revenue > 0) && (
            <div className="mt-5 pt-5 border-t border-gray-700">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Revenue by Package</p>
              <HBar
                data={data.revenue.packageBreakdown
                  .filter((p) => p.revenue > 0)
                  .map((p) => ({ label: p.name, value: p.revenue }))}
                color="#10b981"
                formatValue={fmt$}
              />
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-5 border-l-4 border-emerald-500">
          <div className="text-xs text-gray-500 uppercase mb-1">Best Month</div>
          <div className="text-white font-bold">
            {bestRevMonth && bestRevMonth.net > 0
              ? `${bestRevMonth.month} — Net ${fmt$(bestRevMonth.net)}`
              : "No data yet"}
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border-l-4 border-blue-500">
          <div className="text-xs text-gray-500 uppercase mb-1">6-Month Average</div>
          <div className="text-white font-bold">
            {fmt$(
              data.revenue.classRevenueByMonth.reduce((s, m) => s + m.net, 0) /
                Math.max(data.revenue.classRevenueByMonth.length, 1),
            )}
            /mo
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border-l-4 border-purple-500">
          <div className="text-xs text-gray-500 uppercase mb-1">Revenue / Client</div>
          <div className="text-white font-bold">
            {data.clients.totalUsers > 0 ? fmt$(data.revenue.classNet / data.clients.totalUsers) : fmt$(0)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueTab;
