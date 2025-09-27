import React, { useState, useEffect } from "react";

interface AnalyticsData {
  classes: {
    totalClasses: number;
    upcomingClasses: number;
    pastClasses: number;
    averageCapacity: number;
    totalBookings: number;
    completedClasses: number;
    cancelledClasses: number;
    noShowRate: number;
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
  const [activeTab, setActiveTab] = useState<"classes" | "clients" | "revenue">(
    "classes"
  );
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
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "classes", name: "Classes", icon: CalendarIcon },
    { id: "clients", name: "Clients", icon: UsersIcon },
    { id: "revenue", name: "Revenue", icon: CurrencyDollarIcon },
  ];

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">
        Analytics Dashboard
      </h2>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-red-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            <tab.icon className="w-5 h-5 mr-2" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {data && (
        <>
          {/* Classes Tab */}
          {activeTab === "classes" && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <CalendarIcon className="w-8 h-8 text-red-500" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-400">Total Classes</p>
                      <p className="text-xl font-bold text-white">
                        {data.classes.totalClasses}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <UserGroupIcon className="w-8 h-8 text-blue-500" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-400">Total Bookings</p>
                      <p className="text-xl font-bold text-white">
                        {data.classes.totalBookings}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <ClockIcon className="w-8 h-8 text-green-500" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-400">Upcoming Classes</p>
                      <p className="text-xl font-bold text-white">
                        {data.classes.upcomingClasses}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <ChartBarIcon className="w-8 h-8 text-purple-500" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-400">
                        Avg. Bookings/Class
                      </p>
                      <p className="text-xl font-bold text-white">
                        {data.classes.averageCapacity}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Class Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Popular Times */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <ClockIcon className="w-5 h-5 mr-2 text-red-500" />
                    Popular Class Times
                  </h3>
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

                {/* Weekly Schedule */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-2 text-blue-500" />
                    Weekly Class Distribution
                  </h3>
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

              {/* Class Types and Instructors */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Class Types */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <ChartBarIcon className="w-5 h-5 mr-2 text-green-500" />
                    Class Type Distribution
                  </h3>
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

                {/* Popular Instructors */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <UsersIcon className="w-5 h-5 mr-2 text-purple-500" />
                    Top Instructors
                  </h3>
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

              {/* Monthly Trends */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <TrendingUpIcon className="w-5 h-5 mr-2 text-yellow-500" />
                  Classes & Bookings Trend (Last 6 Months)
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                  {data.classes.classesByMonth.map((month, index) => {
                    const bookings =
                      data.classes.bookingsByMonth[index]?.bookings || 0;
                    return (
                      <div key={index} className="text-center">
                        <div className="text-xs text-gray-400 mb-2">
                          {month.month}
                        </div>
                        <div className="bg-gray-700 rounded-lg p-3 space-y-2">
                          <div>
                            <div className="text-sm text-gray-300">Classes</div>
                            <div className="text-lg font-bold text-white">
                              {month.count}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-300">
                              Bookings
                            </div>
                            <div className="text-lg font-bold text-red-400">
                              {bookings}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === "clients" && (
            <div className="space-y-6">
              {/* Key Client Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <UsersIcon className="w-8 h-8 text-blue-500" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-400">Total Users</p>
                      <p className="text-xl font-bold text-white">
                        {data.clients.totalUsers}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <UserGroupIcon className="w-8 h-8 text-green-500" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-400">
                        Active Users (30d)
                      </p>
                      <p className="text-xl font-bold text-white">
                        {data.clients.activeUsers}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <TrendingUpIcon className="w-8 h-8 text-purple-500" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-400">New This Month</p>
                      <p className="text-xl font-bold text-white">
                        {data.clients.newUsersThisMonth}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <ChartBarIcon className="w-8 h-8 text-red-500" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-400">Growth Rate</p>
                      <p
                        className={`text-xl font-bold ${
                          data.clients.userGrowthRate >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {formatPercentage(data.clients.userGrowthRate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Engagement Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {data.clients.totalUsers > 0
                        ? Math.round(
                            (data.clients.activeUsers /
                              data.clients.totalUsers) *
                              100
                          )
                        : 0}
                      %
                    </div>
                    <div className="text-sm text-gray-400">
                      User Engagement Rate
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Active users / Total users
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {data.clients.activeUsers > 0
                        ? Math.round(
                            data.clients.bookingPatterns.reduce(
                              (sum, p) => sum + p.bookings,
                              0
                            ) / data.clients.activeUsers
                          )
                        : 0}
                    </div>
                    <div className="text-sm text-gray-400">
                      Avg. Bookings per Active User
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Total bookings / Active users
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {data.clients.newUsersThisMonth}
                    </div>
                    <div className="text-sm text-gray-400">
                      New Users This Month
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      User acquisition trend
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Patterns by Day */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Booking Patterns by Day of Week
                </h3>
                <div className="space-y-3">
                  {data.clients.bookingPatterns.map((pattern, index) => {
                    const maxBookings = Math.max(
                      ...data.clients.bookingPatterns.map((p) => p.bookings)
                    );
                    const percentage =
                      maxBookings > 0
                        ? (pattern.bookings / maxBookings) * 100
                        : 0;
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
                              style={{ width: `${Math.max(percentage, 5)}%` }}
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

              {/* User Growth Trend */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <TrendingUpIcon className="w-5 h-5 mr-2 text-green-500" />
                  User Registration Trend (Last 6 Months)
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                  {data.clients.usersByMonth.map((month, index) => {
                    const maxUsers = Math.max(
                      ...data.clients.usersByMonth.map((m) => m.count)
                    );
                    const height =
                      maxUsers > 0
                        ? Math.max((month.count / maxUsers) * 100, 10)
                        : 10;
                    return (
                      <div key={index} className="text-center">
                        <div className="text-xs text-gray-400 mb-2">
                          {month.month}
                        </div>
                        <div className="flex flex-col items-center">
                          <div
                            className="bg-gradient-to-t from-green-500 to-green-400 w-8 rounded-t transition-all duration-500 mb-2 flex items-end justify-center"
                            style={{ height: `${height}px`, minHeight: "20px" }}
                          >
                            <span className="text-white text-xs font-bold pb-1">
                              {month.count}
                            </span>
                          </div>
                          <div className="text-lg font-bold text-white">
                            {month.count}
                          </div>
                          <div className="text-xs text-gray-400">users</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === "revenue" && (
            <div className="space-y-6">
              {/* Key Revenue Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="w-8 h-8 text-green-500" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-400">Total Revenue</p>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(data.revenue.totalRevenue)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <TrendingUpIcon className="w-8 h-8 text-blue-500" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-400">This Month</p>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(data.revenue.monthlyRevenue)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <ChartBarIcon className="w-8 h-8 text-purple-500" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-400">Monthly Growth</p>
                      <p
                        className={`text-xl font-bold ${
                          data.revenue.revenueGrowth >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {formatPercentage(data.revenue.revenueGrowth)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <UserGroupIcon className="w-8 h-8 text-red-500" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-400">Packages Sold</p>
                      <p className="text-xl font-bold text-white">
                        {data.revenue.packagesSold}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <CreditCardIcon className="w-8 h-8 text-yellow-500" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-400">Avg. Order Value</p>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(data.revenue.averageOrderValue)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Performance Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {data.revenue.packagesSold > 0
                        ? formatCurrency(
                            data.revenue.totalRevenue /
                              data.revenue.packagesSold
                          )
                        : formatCurrency(0)}
                    </div>
                    <div className="text-sm text-gray-400">
                      Revenue per Package
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Average package value
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {data.revenue.monthlyRevenue > 0
                        ? Math.round(
                            (data.revenue.monthlyRevenue /
                              data.revenue.totalRevenue) *
                              100
                          )
                        : 0}
                      %
                    </div>
                    <div className="text-sm text-gray-400">
                      Monthly Revenue %
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Of total revenue
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${
                        data.revenue.revenueGrowth >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {data.revenue.revenueGrowth >= 0 ? "↗" : "↙"}{" "}
                      {Math.abs(data.revenue.revenueGrowth).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">Growth Trend</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Month over month
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Trend Chart */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <TrendingUpIcon className="w-5 h-5 mr-2 text-green-500" />
                  Revenue Trend (Last 6 Months)
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                  {data.revenue.revenueByMonth.map((month, index) => {
                    const maxRevenue = Math.max(
                      ...data.revenue.revenueByMonth.map((m) => m.amount)
                    );
                    const height =
                      maxRevenue > 0
                        ? Math.max((month.amount / maxRevenue) * 120, 20)
                        : 20;
                    return (
                      <div key={index} className="text-center">
                        <div className="text-xs text-gray-400 mb-2">
                          {month.month}
                        </div>
                        <div className="flex flex-col items-center">
                          <div
                            className="bg-gradient-to-t from-green-500 to-green-300 w-12 rounded-t transition-all duration-500 mb-2 flex items-end justify-center"
                            style={{ height: `${height}px`, minHeight: "30px" }}
                          >
                            <span className="text-white text-xs font-bold pb-1 transform -rotate-90 origin-center">
                              ${Math.round(month.amount)}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-white">
                            {formatCurrency(month.amount)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Methods Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <CreditCardIcon className="w-5 h-5 mr-2 text-yellow-500" />
                    Payment Methods Distribution
                  </h3>
                  <div className="space-y-4">
                    {data.revenue.paymentMethods.map((method, index) => {
                      const maxCount = Math.max(
                        ...data.revenue.paymentMethods.map((m) => m.count)
                      );
                      const percentage =
                        maxCount > 0 ? (method.count / maxCount) * 100 : 0;
                      const totalCount = data.revenue.paymentMethods.reduce(
                        (sum, m) => sum + m.count,
                        0
                      );
                      const methodPercentage =
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
                                ({methodPercentage}%)
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(percentage, 5)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Revenue Summary */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <ChartBarIcon className="w-5 h-5 mr-2 text-purple-500" />
                    Revenue Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-green-500 pl-4">
                      <div className="text-sm text-gray-400">Total Revenue</div>
                      <div className="text-xl font-bold text-white">
                        {formatCurrency(data.revenue.totalRevenue)}
                      </div>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <div className="text-sm text-gray-400">
                        Average Monthly Revenue
                      </div>
                      <div className="text-xl font-bold text-white">
                        {formatCurrency(
                          data.revenue.revenueByMonth.reduce(
                            (sum, m) => sum + m.amount,
                            0
                          ) / 6
                        )}
                      </div>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
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
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <div className="text-sm text-gray-400">
                        Revenue Growth
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          data.revenue.revenueGrowth >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {formatPercentage(data.revenue.revenueGrowth)} vs last
                        month
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
