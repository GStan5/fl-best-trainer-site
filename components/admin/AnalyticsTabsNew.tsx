import React, { useState, useEffect } from "react";

interface AnalyticsData {
  classes: {
    totalClasses: number;
    upcomingClasses: number;
    pastClasses: number;
    averageCapacity: number;
    totalBookings: number;
    completedClasses: number;
    popularInstructors: { name: string; classes: number }[];
    classTypeDistribution: { type: string; count: number }[];
    popularTimes: { time: string; count: number }[];
    classesByMonth: { month: string; count: number }[];
    bookingsByMonth: { month: string; bookings: number }[];
    weeklyClassSchedule: { day: string; classes: number }[];
  };
  clients: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    userGrowthRate: number;
    bookingPatterns: { day: string; bookings: number }[];
    usersByMonth: { month: string; count: number }[];
  };
  revenue: {
    totalRevenue: number;
    monthlyRevenue: number;
    revenueGrowth: number;
    packagesSold: number;
    averageOrderValue: number;
    revenueByMonth: { month: string; amount: number }[];
    paymentMethods: { method: string; count: number }[];
  };
}

const AnalyticsTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "classes" | "clients" | "revenue"
  >("overview");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/analytics");
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-6">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", name: "Overview", emoji: "📊" },
    { id: "classes", name: "Classes", emoji: "🏋️" },
    { id: "clients", name: "Clients", emoji: "👥" },
    { id: "revenue", name: "Revenue", emoji: "💰" },
  ];

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">
        📈 Business Analytics Dashboard
      </h2>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-red-600 text-white shadow-lg scale-105"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <span className="text-xl mr-2">{tab.emoji}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {data && (
        <>
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Key Business Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-200 text-sm font-medium">
                        Total Classes
                      </p>
                      <p className="text-3xl font-bold">
                        {data.classes.totalClasses}
                      </p>
                    </div>
                    <span className="text-4xl">🏋️</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-200 text-sm font-medium">
                        Total Users
                      </p>
                      <p className="text-3xl font-bold">
                        {data.clients.totalUsers}
                      </p>
                    </div>
                    <span className="text-4xl">👥</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm font-medium">
                        Total Revenue
                      </p>
                      <p className="text-3xl font-bold">
                        {formatCurrency(data.revenue.totalRevenue)}
                      </p>
                    </div>
                    <span className="text-4xl">💰</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-200 text-sm font-medium">
                        Total Bookings
                      </p>
                      <p className="text-3xl font-bold">
                        {data.classes.totalBookings}
                      </p>
                    </div>
                    <span className="text-4xl">📅</span>
                  </div>
                </div>
              </div>

              {/* Business Health Indicators */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">
                    📈 Growth Rate
                  </h3>
                  <div className="text-center">
                    <div
                      className={`text-4xl font-bold mb-2 ${
                        data.clients.userGrowthRate >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {formatPercentage(data.clients.userGrowthRate)}
                    </div>
                    <p className="text-gray-400">User growth this month</p>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">
                    🎯 Engagement
                  </h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-400 mb-2">
                      {data.clients.totalUsers > 0
                        ? Math.round(
                            (data.clients.activeUsers /
                              data.clients.totalUsers) *
                              100
                          )
                        : 0}
                      %
                    </div>
                    <p className="text-gray-400">Active user rate</p>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">
                    💵 Average Order
                  </h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">
                      {formatCurrency(data.revenue.averageOrderValue)}
                    </div>
                    <p className="text-gray-400">Per package sale</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 text-center">
                  ⚡ Quick Stats
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {data.classes.upcomingClasses}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Upcoming Classes
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-cyan-400">
                      {data.clients.activeUsers}
                    </div>
                    <div className="text-gray-400 text-sm">Active Users</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-pink-400">
                      {data.revenue.packagesSold}
                    </div>
                    <div className="text-gray-400 text-sm">Packages Sold</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-400">
                      {data.classes.totalClasses > 0
                        ? (
                            data.classes.totalBookings /
                            data.classes.totalClasses
                          ).toFixed(1)
                        : 0}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Avg Bookings/Class
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Classes Tab */}
          {activeTab === "classes" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white text-center mb-6">
                🏋️ Class Analytics
              </h3>

              {/* Class Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">📅</div>
                  <div className="text-2xl font-bold text-white">
                    {data.classes.totalClasses}
                  </div>
                  <div className="text-gray-400">Total Classes</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-2xl font-bold text-white">
                    {data.classes.totalBookings}
                  </div>
                  <div className="text-gray-400">Total Bookings</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">⏰</div>
                  <div className="text-2xl font-bold text-white">
                    {data.classes.upcomingClasses}
                  </div>
                  <div className="text-gray-400">Upcoming</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-2xl font-bold text-white">
                    {data.classes.averageCapacity}
                  </div>
                  <div className="text-gray-400">Avg Bookings/Class</div>
                </div>
              </div>

              {/* Popular Times & Weekly Schedule */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">⏰</span>
                    Popular Class Times
                  </h4>
                  <div className="space-y-3">
                    {data.classes.popularTimes.map((time, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-300 font-medium">
                          {time.time}
                        </span>
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-700 rounded-full h-3 mr-3">
                            <div
                              className="bg-gradient-to-r from-red-500 to-red-400 h-3 rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  (time.count /
                                    Math.max(
                                      ...data.classes.popularTimes.map(
                                        (t) => t.count
                                      )
                                    )) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-white font-bold text-sm w-8">
                            {time.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">📅</span>
                    Weekly Schedule
                  </h4>
                  <div className="space-y-3">
                    {data.classes.weeklyClassSchedule.map((day, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-300 font-medium">
                          {day.day}
                        </span>
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-700 rounded-full h-3 mr-3">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  (day.classes /
                                    Math.max(
                                      ...data.classes.weeklyClassSchedule.map(
                                        (d) => d.classes
                                      )
                                    )) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-white font-bold text-sm w-8">
                            {day.classes}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Class Types & Instructors */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">🏃</span>
                    Class Types
                  </h4>
                  <div className="space-y-3">
                    {data.classes.classTypeDistribution
                      .slice(0, 5)
                      .map((type, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-gray-300 font-medium capitalize">
                            {type.type}
                          </span>
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-700 rounded-full h-3 mr-3">
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-300"
                                style={{
                                  width: `${
                                    (type.count /
                                      Math.max(
                                        ...data.classes.classTypeDistribution.map(
                                          (t) => t.count
                                        )
                                      )) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-white font-bold text-sm w-8">
                              {type.count}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">👨‍🏫</span>
                    Top Instructors
                  </h4>
                  <div className="space-y-3">
                    {data.classes.popularInstructors.map(
                      (instructor, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-gray-300 font-medium">
                            {instructor.name}
                          </span>
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-700 rounded-full h-3 mr-3">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-purple-400 h-3 rounded-full transition-all duration-300"
                                style={{
                                  width: `${
                                    (instructor.classes /
                                      Math.max(
                                        ...data.classes.popularInstructors.map(
                                          (i) => i.classes
                                        )
                                      )) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-white font-bold text-sm w-8">
                              {instructor.classes}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === "clients" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white text-center mb-6">
                👥 Client Analytics
              </h3>

              {/* Client Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">👥</div>
                  <div className="text-2xl font-bold text-white">
                    {data.clients.totalUsers}
                  </div>
                  <div className="text-gray-400">Total Users</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-2xl font-bold text-white">
                    {data.clients.activeUsers}
                  </div>
                  <div className="text-gray-400">Active Users</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">🆕</div>
                  <div className="text-2xl font-bold text-white">
                    {data.clients.newUsersThisMonth}
                  </div>
                  <div className="text-gray-400">New This Month</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">📈</div>
                  <div
                    className={`text-2xl font-bold ${
                      data.clients.userGrowthRate >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {formatPercentage(data.clients.userGrowthRate)}
                  </div>
                  <div className="text-gray-400">Growth Rate</div>
                </div>
              </div>

              {/* Engagement & Booking Patterns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">📊</span>
                    Engagement Metrics
                  </h4>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gray-700 rounded-lg">
                      <div className="text-3xl font-bold text-blue-400">
                        {data.clients.totalUsers > 0
                          ? Math.round(
                              (data.clients.activeUsers /
                                data.clients.totalUsers) *
                                100
                            )
                          : 0}
                        %
                      </div>
                      <div className="text-gray-300">User Engagement Rate</div>
                    </div>
                    <div className="text-center p-4 bg-gray-700 rounded-lg">
                      <div className="text-3xl font-bold text-green-400">
                        {data.clients.activeUsers > 0
                          ? Math.round(
                              data.clients.bookingPatterns.reduce(
                                (sum, p) => sum + p.bookings,
                                0
                              ) / data.clients.activeUsers
                            )
                          : 0}
                      </div>
                      <div className="text-gray-300">Avg Bookings per User</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">📅</span>
                    Booking by Day
                  </h4>
                  <div className="space-y-3">
                    {data.clients.bookingPatterns.map((pattern, index) => {
                      const maxBookings = Math.max(
                        ...data.clients.bookingPatterns.map((p) => p.bookings)
                      );
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-gray-300 font-medium w-20">
                            {pattern.day}
                          </span>
                          <div className="flex items-center flex-1 ml-4">
                            <div className="w-full bg-gray-700 rounded-full h-4 mr-4">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-blue-400 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                style={{
                                  width: `${
                                    maxBookings > 0
                                      ? Math.max(
                                          (pattern.bookings / maxBookings) *
                                            100,
                                          5
                                        )
                                      : 5
                                  }%`,
                                }}
                              >
                                <span className="text-white text-xs font-bold">
                                  {pattern.bookings > 0 ? pattern.bookings : ""}
                                </span>
                              </div>
                            </div>
                            <span className="text-white font-bold text-sm w-12 text-right">
                              {pattern.bookings}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === "revenue" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white text-center mb-6">
                💰 Revenue Analytics
              </h3>

              {/* Revenue Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(data.revenue.totalRevenue)}
                  </div>
                  <div className="text-gray-400">Total Revenue</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">📅</div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(data.revenue.monthlyRevenue)}
                  </div>
                  <div className="text-gray-400">This Month</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">📈</div>
                  <div
                    className={`text-2xl font-bold ${
                      data.revenue.revenueGrowth >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {formatPercentage(data.revenue.revenueGrowth)}
                  </div>
                  <div className="text-gray-400">Growth Rate</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">📦</div>
                  <div className="text-2xl font-bold text-white">
                    {data.revenue.packagesSold}
                  </div>
                  <div className="text-gray-400">Packages Sold</div>
                </div>
              </div>

              {/* Revenue Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    💵 Average Order
                  </h4>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {formatCurrency(data.revenue.averageOrderValue)}
                  </div>
                  <div className="text-gray-400">Per package sale</div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    📊 Monthly Share
                  </h4>
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {data.revenue.monthlyRevenue > 0
                      ? Math.round(
                          (data.revenue.monthlyRevenue /
                            data.revenue.totalRevenue) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-gray-400">Of total revenue</div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    🎯 Revenue Trend
                  </h4>
                  <div
                    className={`text-3xl font-bold mb-2 ${
                      data.revenue.revenueGrowth >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {data.revenue.revenueGrowth >= 0 ? "📈" : "📉"}
                  </div>
                  <div className="text-gray-400">
                    {data.revenue.revenueGrowth >= 0 ? "Growing" : "Declining"}
                  </div>
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">💳</span>
                    Payment Methods
                  </h4>
                  <div className="space-y-4">
                    {data.revenue.paymentMethods.map((method, index) => {
                      const totalCount = data.revenue.paymentMethods.reduce(
                        (sum, m) => sum + m.count,
                        0
                      );
                      const percentage =
                        totalCount > 0
                          ? ((method.count / totalCount) * 100).toFixed(1)
                          : 0;

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300 font-medium">
                              {method.method}
                            </span>
                            <div className="text-right">
                              <span className="text-white font-bold">
                                {method.count}
                              </span>
                              <span className="text-gray-400 text-sm ml-2">
                                ({percentage}%)
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-3 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.max(
                                  parseFloat(percentage.toString()),
                                  5
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">📈</span>
                    Revenue Summary
                  </h4>
                  <div className="space-y-4">
                    <div className="border-l-4 border-green-500 pl-4">
                      <div className="text-sm text-gray-400">Best Month</div>
                      <div className="text-lg font-bold text-white">
                        {(() => {
                          const bestMonth = data.revenue.revenueByMonth.reduce(
                            (max, m) => (m.amount > max.amount ? m : max)
                          );
                          return `${bestMonth.month} (${formatCurrency(
                            bestMonth.amount
                          )})`;
                        })()}
                      </div>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <div className="text-sm text-gray-400">
                        Average Monthly
                      </div>
                      <div className="text-lg font-bold text-white">
                        {formatCurrency(
                          data.revenue.revenueByMonth.reduce(
                            (sum, m) => sum + m.amount,
                            0
                          ) / 6
                        )}
                      </div>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <div className="text-sm text-gray-400">
                        Revenue per Package
                      </div>
                      <div className="text-lg font-bold text-white">
                        {data.revenue.packagesSold > 0
                          ? formatCurrency(
                              data.revenue.totalRevenue /
                                data.revenue.packagesSold
                            )
                          : formatCurrency(0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsTabs;
