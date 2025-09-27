import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Check if user is admin
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const client = await pool.connect();

    try {
      // Check admin status
      const adminCheck = await client.query(
        "SELECT is_admin FROM users WHERE email = $1",
        [session.user.email]
      );

      if (!adminCheck.rows[0]?.is_admin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get current date for calculations
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // ===== CLASSES ANALYTICS =====
      const classesData = {
        totalClasses: 0,
        upcomingClasses: 0,
        pastClasses: 0,
        averageCapacity: 0,
        totalBookings: 0,
        completedClasses: 0,
        cancelledClasses: 0,
        noShowRate: 0,
        popularInstructors: [] as { name: string; classes: number }[],
        classTypeDistribution: [] as { type: string; count: number }[],
        popularTimes: [] as { time: string; count: number }[],
        classesByMonth: [] as { month: string; count: number }[],
        bookingsByMonth: [] as { month: string; bookings: number }[],
        weeklyClassSchedule: [] as { day: string; classes: number }[],
      };

      // Total classes
      const totalClassesResult = await client.query(
        "SELECT COUNT(*) FROM classes"
      );
      classesData.totalClasses = parseInt(totalClassesResult.rows[0].count);

      // Upcoming vs past classes
      const upcomingClassesResult = await client.query(
        "SELECT COUNT(*) FROM classes WHERE date > CURRENT_DATE OR (date = CURRENT_DATE AND start_time > CURRENT_TIME)"
      );
      classesData.upcomingClasses = parseInt(
        upcomingClassesResult.rows[0].count
      );
      classesData.pastClasses =
        classesData.totalClasses - classesData.upcomingClasses;

      // Total bookings
      const totalBookingsResult = await client.query(
        "SELECT COUNT(*) FROM bookings"
      );
      classesData.totalBookings = parseInt(totalBookingsResult.rows[0].count);

      // Calculate average capacity (bookings per class)
      if (classesData.totalClasses > 0) {
        classesData.averageCapacity =
          Math.round(
            (classesData.totalBookings / classesData.totalClasses) * 100
          ) / 100;
      }

      // Completed classes (past classes)
      classesData.completedClasses = classesData.pastClasses;

      // Popular instructors
      const instructorsResult = await client.query(`
        SELECT instructor, COUNT(*) as class_count 
        FROM classes 
        WHERE instructor IS NOT NULL AND instructor != ''
        GROUP BY instructor 
        ORDER BY class_count DESC 
        LIMIT 5
      `);
      classesData.popularInstructors = instructorsResult.rows.map((row) => ({
        name: row.instructor,
        classes: parseInt(row.class_count),
      }));

      // Class type distribution
      const classTypesResult = await client.query(`
        SELECT class_type, COUNT(*) as type_count 
        FROM classes 
        WHERE class_type IS NOT NULL AND class_type != ''
        GROUP BY class_type 
        ORDER BY type_count DESC
      `);
      classesData.classTypeDistribution = classTypesResult.rows.map((row) => ({
        type: row.class_type,
        count: parseInt(row.type_count),
      }));

      // Popular times (based on actual class data)
      const popularTimesResult = await client.query(`
        SELECT 
          EXTRACT(HOUR FROM start_time) as hour,
          COUNT(*) as class_count
        FROM classes 
        GROUP BY EXTRACT(HOUR FROM start_time)
        ORDER BY class_count DESC
        LIMIT 5
      `);

      classesData.popularTimes = popularTimesResult.rows.map((row) => {
        const hour = parseInt(row.hour);
        const timeString =
          hour === 0
            ? "12:00 AM"
            : hour < 12
            ? `${hour}:00 AM`
            : hour === 12
            ? "12:00 PM"
            : `${hour - 12}:00 PM`;
        return {
          time: timeString,
          count: parseInt(row.class_count),
        };
      });

      // Classes by month (last 6 months)
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(
          now.getFullYear(),
          now.getMonth() - i + 1,
          1
        );

        const monthResult = await client.query(
          "SELECT COUNT(*) FROM classes WHERE date >= $1 AND date < $2",
          [
            monthDate.toISOString().split("T")[0],
            nextMonth.toISOString().split("T")[0],
          ]
        );

        classesData.classesByMonth.push({
          month: monthDate.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          count: parseInt(monthResult.rows[0].count),
        });
      }

      // Bookings by month (last 6 months)
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(
          now.getFullYear(),
          now.getMonth() - i + 1,
          1
        );

        const monthResult = await client.query(
          "SELECT COUNT(*) FROM bookings WHERE created_at >= $1 AND created_at < $2",
          [monthDate, nextMonth]
        );

        classesData.bookingsByMonth.push({
          month: monthDate.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          bookings: parseInt(monthResult.rows[0].count),
        });
      }

      // Weekly class schedule (by day of week)
      const weeklyScheduleResult = await client.query(`
        SELECT 
          EXTRACT(DOW FROM date) as day_num,
          COUNT(*) as class_count
        FROM classes 
        GROUP BY EXTRACT(DOW FROM date)
        ORDER BY day_num
      `);

      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      classesData.weeklyClassSchedule = weeklyScheduleResult.rows.map(
        (row) => ({
          day: days[parseInt(row.day_num)],
          classes: parseInt(row.class_count),
        })
      );

      // ===== CLIENTS ANALYTICS =====
      const clientsData = {
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
        userGrowthRate: 0,
        bookingPatterns: [] as { day: string; bookings: number }[],
        usersByMonth: [] as { month: string; count: number }[],
      };

      // Total users
      const totalUsersResult = await client.query("SELECT COUNT(*) FROM users");
      clientsData.totalUsers = parseInt(totalUsersResult.rows[0].count);

      // Active users (users with bookings in last 30 days)
      const activeUsersResult = await client.query(
        "SELECT COUNT(DISTINCT user_id) FROM bookings WHERE created_at > NOW() - INTERVAL '30 days'"
      );
      clientsData.activeUsers = parseInt(activeUsersResult.rows[0].count);

      // New users this month
      const newUsersResult = await client.query(
        "SELECT COUNT(*) FROM users WHERE created_at >= $1",
        [startOfMonth]
      );
      clientsData.newUsersThisMonth = parseInt(newUsersResult.rows[0].count);

      // User growth rate (compared to last month)
      const lastMonthUsersResult = await client.query(
        "SELECT COUNT(*) FROM users WHERE created_at >= $1 AND created_at < $2",
        [startOfLastMonth, endOfLastMonth]
      );
      const lastMonthUsers = parseInt(lastMonthUsersResult.rows[0].count);

      if (lastMonthUsers > 0) {
        clientsData.userGrowthRate =
          ((clientsData.newUsersThisMonth - lastMonthUsers) / lastMonthUsers) *
          100;
      }

      // Booking patterns by day of week
      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      for (let i = 0; i < 7; i++) {
        const dayBookingsResult = await client.query(
          "SELECT COUNT(*) FROM bookings WHERE EXTRACT(DOW FROM created_at) = $1",
          [i]
        );
        clientsData.bookingPatterns.push({
          day: daysOfWeek[i],
          bookings: parseInt(dayBookingsResult.rows[0].count),
        });
      }

      // Users by month (last 6 months)
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(
          now.getFullYear(),
          now.getMonth() - i + 1,
          1
        );

        const monthResult = await client.query(
          "SELECT COUNT(*) FROM users WHERE created_at >= $1 AND created_at < $2",
          [monthDate, nextMonth]
        );

        clientsData.usersByMonth.push({
          month: monthDate.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          count: parseInt(monthResult.rows[0].count),
        });
      }

      // ===== REVENUE ANALYTICS =====
      const revenueData = {
        totalRevenue: 0,
        monthlyRevenue: 0,
        revenueGrowth: 0,
        packagesSold: 0,
        averageOrderValue: 0,
        revenueByMonth: [] as { month: string; amount: number }[],
        paymentMethods: [] as { method: string; count: number }[],
      };

      // Total revenue from user_packages
      const totalRevenueResult = await client.query(`
        SELECT COALESCE(SUM(p.price), 0) as total 
        FROM user_packages up 
        JOIN packages p ON up.package_id = p.id
      `);
      revenueData.totalRevenue = parseFloat(totalRevenueResult.rows[0].total);

      // Monthly revenue
      const monthlyRevenueResult = await client.query(
        `
        SELECT COALESCE(SUM(p.price), 0) as total 
        FROM user_packages up 
        JOIN packages p ON up.package_id = p.id 
        WHERE up.purchase_date >= $1
      `,
        [startOfMonth]
      );
      revenueData.monthlyRevenue = parseFloat(
        monthlyRevenueResult.rows[0].total
      );

      // Last month revenue for growth calculation
      const lastMonthRevenueResult = await client.query(
        `
        SELECT COALESCE(SUM(p.price), 0) as total 
        FROM user_packages up 
        JOIN packages p ON up.package_id = p.id 
        WHERE up.purchase_date >= $1 AND up.purchase_date < $2
      `,
        [startOfLastMonth, endOfLastMonth]
      );
      const lastMonthRevenue = parseFloat(lastMonthRevenueResult.rows[0].total);

      if (lastMonthRevenue > 0) {
        revenueData.revenueGrowth =
          ((revenueData.monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) *
          100;
      }

      // Packages sold
      const packagesSoldResult = await client.query(
        "SELECT COUNT(*) FROM user_packages"
      );
      revenueData.packagesSold = parseInt(packagesSoldResult.rows[0].count);

      // Average order value
      if (revenueData.packagesSold > 0) {
        revenueData.averageOrderValue =
          revenueData.totalRevenue / revenueData.packagesSold;
      }

      // Revenue by month (last 6 months)
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(
          now.getFullYear(),
          now.getMonth() - i + 1,
          1
        );

        const monthResult = await client.query(
          `
          SELECT COALESCE(SUM(p.price), 0) as total 
          FROM user_packages up 
          JOIN packages p ON up.package_id = p.id 
          WHERE up.purchase_date >= $1 AND up.purchase_date < $2
        `,
          [monthDate, nextMonth]
        );

        revenueData.revenueByMonth.push({
          month: monthDate.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          amount: parseFloat(monthResult.rows[0].total),
        });
      }

      // Payment methods (mock data since we don't track this in detail)
      revenueData.paymentMethods = [
        {
          method: "Credit Card",
          count: Math.floor(revenueData.packagesSold * 0.7),
        },
        {
          method: "Debit Card",
          count: Math.floor(revenueData.packagesSold * 0.2),
        },
        { method: "PayPal", count: Math.floor(revenueData.packagesSold * 0.1) },
      ].filter((method) => method.count > 0);

      const analyticsData = {
        classes: classesData,
        clients: clientsData,
        revenue: revenueData,
      };

      res.status(200).json(analyticsData);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Analytics API error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
