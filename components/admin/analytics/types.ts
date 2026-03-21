export interface TopClient {
  name: string;
  email: string;
  bookings: number;
  lastClassDate: string;
}

export interface PackageBreakdown {
  name: string;
  price: number;
  sessionsIncluded: number;
  sold: number;
  revenue: number;
}

export interface ClassRevenueMonth {
  month: string;
  bookings: number;
  gross: number;
  gymCost: number;
  net: number;
}

export interface AnalyticsData {
  classes: {
    totalClasses: number;
    upcomingClasses: number;
    pastClasses: number;
    averageCapacity: number;
    totalBookings: number;
    completedClasses: number;
    avgFillRate: number;
    pastFillRate: number;
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
    topClients: TopClient[];
  };
  revenue: {
    totalRevenue: number;
    monthlyRevenue: number;
    revenueGrowth: number;
    packagesSold: number;
    averageOrderValue: number;
    revenueByMonth: { month: string; amount: number }[];
    packageBreakdown: PackageBreakdown[];
    classGross: number;
    classGymCost: number;
    classNet: number;
    monthlyClassGross: number;
    monthlyClassGymCost: number;
    monthlyClassNet: number;
    classRevenueGrowth: number;
    classRevenueByMonth: ClassRevenueMonth[];
    completedBookings: number;
  };
}
