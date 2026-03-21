import React from "react";
import { AnalyticsData } from "../types";
import { fmt$ } from "../utils";
import KpiCard from "../ui/KpiCard";
import Card from "../ui/Card";
import Insight from "../ui/Insight";
import BarChart from "../charts/BarChart";
import LineChart from "../charts/LineChart";

const OverviewTab: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const fillDisplay = data.classes.pastFillRate > 0 ? data.classes.pastFillRate : data.classes.avgFillRate;

  const busyDay =
    data.classes.weeklyClassSchedule.length > 0
      ? data.classes.weeklyClassSchedule.reduce((a, b) => (a.classes > b.classes ? a : b))
      : null;
  const popularTime = data.classes.popularTimes[0] ?? null;
  const topClient = data.clients.topClients[0] ?? null;
  const engagementRate =
    data.clients.totalUsers > 0
      ? Math.round((data.clients.activeUsers / data.clients.totalUsers) * 100)
      : 0;
  const bestRevMonth =
    data.revenue.classRevenueByMonth.length > 0
      ? data.revenue.classRevenueByMonth.reduce((a, b) => (a.net > b.net ? a : b))
      : null;
  const topPackage = (data.revenue.packageBreakdown ?? []).find((p) => p.sold > 0) ?? null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Net Revenue"
          value={fmt$(data.revenue.classNet)}
          sub={`${fmt$(data.revenue.monthlyClassNet)} this month`}
          gradient="bg-gradient-to-br from-emerald-700 to-emerald-900"
          icon="💰"
          trend={data.revenue.classRevenueGrowth}
        />
        <KpiCard
          label="Total Clients"
          value={data.clients.totalUsers}
          sub={`${data.clients.activeUsers} active last 30d`}
          gradient="bg-gradient-to-br from-blue-700 to-blue-900"
          icon="👥"
          trend={data.clients.userGrowthRate}
        />
        <KpiCard
          label="Total Bookings"
          value={data.classes.totalBookings}
          sub={`${data.classes.upcomingClasses} classes upcoming`}
          gradient="bg-gradient-to-br from-purple-700 to-purple-900"
          icon="📅"
        />
        <KpiCard
          label="Avg Fill Rate"
          value={`${fillDisplay}%`}
          sub="across all classes"
          gradient="bg-gradient-to-br from-red-700 to-red-900"
          icon="🎯"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Monthly Bookings (last 6 months)">
          <BarChart
            data={data.classes.bookingsByMonth.map((d) => ({ label: d.month, value: d.bookings }))}
            color="#3b82f6"
          />
        </Card>
        <Card title="Net Revenue (last 6 months)">
          <LineChart
            data={data.revenue.classRevenueByMonth.map((d) => ({ label: d.month, value: d.net }))}
            color="#10b981"
            formatValue={fmt$}
          />
        </Card>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
          <span>💡</span> Smart Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {busyDay && (
            <Insight
              icon="📅"
              title="Busiest Day"
              text={`${busyDay.day} is your most scheduled day with ${busyDay.classes} classes.`}
              accent="border-blue-500"
            />
          )}
          {popularTime && (
            <Insight
              icon="⏰"
              title="Top Class Time"
              text={`${popularTime.time} is your most popular time slot with ${popularTime.count} class${popularTime.count !== 1 ? "es" : ""}.`}
              accent="border-yellow-500"
            />
          )}
          {topClient && (
            <Insight
              icon="🌟"
              title="Most Active Client"
              text={`${topClient.name} has attended ${topClient.bookings} classes — your most engaged client!`}
              accent="border-purple-500"
            />
          )}
          <Insight
            icon="📈"
            title="Engagement Rate"
            text={`${engagementRate}% of your clients booked a class in the last 30 days.${
              engagementRate >= 60
                ? " Strong retention!"
                : engagementRate >= 30
                ? " Room to re-engage inactive clients."
                : " Consider reaching out to dormant clients."
            }`}
            accent={
              engagementRate >= 60
                ? "border-green-500"
                : engagementRate >= 30
                ? "border-blue-500"
                : "border-orange-500"
            }
          />
          {fillDisplay > 0 && (
            <Insight
              icon="🎯"
              title="Class Fill Rate"
              text={`Your classes are ${fillDisplay}% full on average. ${
                fillDisplay >= 80
                  ? "Excellent utilization — consider adding more slots!"
                  : fillDisplay >= 50
                  ? "Good. Targeted promotions could push closer to full."
                  : "There's capacity to grow. Try promotions or referral incentives."
              }`}
              accent={
                fillDisplay >= 80
                  ? "border-green-500"
                  : fillDisplay >= 50
                  ? "border-blue-500"
                  : "border-orange-500"
              }
            />
          )}
          {topPackage && (
            <Insight
              icon="📦"
              title="Best-Selling Package"
              text={`"${topPackage.name}" leads with ${topPackage.sold} sale${topPackage.sold !== 1 ? "s" : ""} totaling ${fmt$(topPackage.revenue)}.`}
              accent="border-emerald-500"
            />
          )}
          {bestRevMonth && bestRevMonth.net > 0 && (
            <Insight
              icon="🏆"
              title="Best Revenue Month"
              text={`${bestRevMonth.month} was your strongest month — Net ${fmt$(bestRevMonth.net)} (Gross ${fmt$(bestRevMonth.gross)}).`}
              accent="border-yellow-500"
            />
          )}
          {data.clients.newUsersThisMonth > 0 && (
            <Insight
              icon="🆕"
              title="New Clients This Month"
              text={`${data.clients.newUsersThisMonth} new client${
                data.clients.newUsersThisMonth !== 1 ? "s" : ""
              } joined this month.${
                data.clients.userGrowthRate > 0
                  ? ` Up ${data.clients.userGrowthRate.toFixed(0)}% from last month.`
                  : ""
              }`}
              accent="border-cyan-500"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
