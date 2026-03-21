import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const adminCheck = await pool.query(
      "SELECT is_admin FROM users WHERE email = $1",
      [session.user.email],
    );
    if (!adminCheck.rows[0]?.is_admin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    // Start of the month 5 months ago (for 6-month window)
    const sixMonthsAgoStart = new Date(
      now.getFullYear(),
      now.getMonth() - 5,
      1,
    );

    // Business constants
    const CLASS_RATE = 40; // $40 per person per class
    const GYM_PCT = 0.25; // 25% gym cost

    try {
      // Run all analytics queries in parallel for efficiency
      const [
        classStatsResult,
        fillRateResult,
        totalBookingsResult,
        classTypesResult,
        popularTimesResult,
        weeklyScheduleResult,
        classesByMonthResult,
        bookingsByMonthResult,
        userStatsResult,
        topClientsResult,
        bookingPatternResult,
        usersByMonthResult,
        revenueStatsResult,
        revenueByMonthResult,
        packageBreakdownResult,
        classRevenueStatsResult,
        classRevenueByMonthResult,
      ] = await Promise.all([
        // 1. Class counts
        pool.query(`
          SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE date > CURRENT_DATE OR (date = CURRENT_DATE AND start_time > CURRENT_TIME)) as upcoming,
            COUNT(*) FILTER (WHERE date < CURRENT_DATE OR (date = CURRENT_DATE AND start_time <= CURRENT_TIME)) as past
          FROM classes WHERE is_active = true
        `),
        // 2. Fill rate
        pool.query(`
          SELECT
            ROUND(AVG(CASE WHEN max_participants > 0 THEN current_participants::numeric / max_participants * 100 ELSE 0 END), 1) as avg_fill_rate,
            ROUND(AVG(CASE WHEN max_participants > 0 AND (date < CURRENT_DATE OR (date = CURRENT_DATE AND start_time <= CURRENT_TIME))
              THEN current_participants::numeric / max_participants * 100 ELSE NULL END), 1) as past_fill_rate
          FROM classes WHERE is_active = true
        `),
        // 3. Total bookings
        pool.query("SELECT COUNT(*) FROM bookings"),
        // 4. Class type distribution
        pool.query(`
          SELECT class_type, COUNT(*) as count
          FROM classes WHERE class_type IS NOT NULL AND class_type != '' AND is_active = true
          GROUP BY class_type ORDER BY count DESC
        `),
        // 5. Popular times
        pool.query(`
          SELECT EXTRACT(HOUR FROM start_time)::int as hour, COUNT(*) as count
          FROM classes WHERE is_active = true
          GROUP BY hour ORDER BY count DESC LIMIT 6
        `),
        // 6. Weekly schedule
        pool.query(`
          SELECT EXTRACT(DOW FROM date)::int as day_num, COUNT(*) as count
          FROM classes WHERE is_active = true
          GROUP BY day_num ORDER BY day_num
        `),
        // 7. Classes by month (6-month window)
        pool.query(
          `
          SELECT
            EXTRACT(YEAR FROM date)::int as yr,
            EXTRACT(MONTH FROM date)::int as mo,
            COUNT(*) as count
          FROM classes
          WHERE date >= $1 AND is_active = true
          GROUP BY yr, mo ORDER BY yr, mo
        `,
          [sixMonthsAgoStart],
        ),
        // 8. Bookings by month
        pool.query(
          `
          SELECT
            EXTRACT(YEAR FROM created_at)::int as yr,
            EXTRACT(MONTH FROM created_at)::int as mo,
            COUNT(*) as count
          FROM bookings
          WHERE created_at >= $1
          GROUP BY yr, mo ORDER BY yr, mo
        `,
          [sixMonthsAgoStart],
        ),
        // 9. User stats
        pool.query(
          `
          SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE created_at >= $1) as new_this_month,
            COUNT(*) FILTER (WHERE created_at >= $2 AND created_at < $3) as last_month_new,
            (SELECT COUNT(DISTINCT user_id) FROM bookings WHERE created_at > NOW() - INTERVAL '30 days') as active_users
          FROM users
        `,
          [startOfMonth, startOfLastMonth, endOfLastMonth],
        ),
        // 10. Top clients
        pool.query(`
          SELECT u.name, u.email, COUNT(b.id) as booking_count,
            MAX(c.date) as last_class_date
          FROM users u
          JOIN bookings b ON b.user_id = u.id
          JOIN classes c ON b.class_id = c.id
          GROUP BY u.id, u.name, u.email
          ORDER BY booking_count DESC LIMIT 10
        `),
        // 11. Booking patterns by DOW
        pool.query(`
          SELECT EXTRACT(DOW FROM created_at)::int as day_num, COUNT(*) as count
          FROM bookings GROUP BY day_num ORDER BY day_num
        `),
        // 12. Users by month
        pool.query(
          `
          SELECT
            EXTRACT(YEAR FROM created_at)::int as yr,
            EXTRACT(MONTH FROM created_at)::int as mo,
            COUNT(*) as count
          FROM users
          WHERE created_at >= $1
          GROUP BY yr, mo ORDER BY yr, mo
        `,
          [sixMonthsAgoStart],
        ),
        // 13. Revenue stats
        pool.query(
          `
          SELECT
            COALESCE(SUM(p.price), 0) as total_revenue,
            COALESCE(SUM(p.price) FILTER (WHERE up.purchase_date >= $1), 0) as monthly_revenue,
            COALESCE(SUM(p.price) FILTER (WHERE up.purchase_date >= $2 AND up.purchase_date < $3), 0) as last_month_revenue,
            COUNT(up.id) as total_packages_sold
          FROM user_packages up JOIN packages p ON up.package_id = p.id
        `,
          [startOfMonth, startOfLastMonth, endOfLastMonth],
        ),
        // 14. Revenue by month
        pool.query(
          `
          SELECT
            EXTRACT(YEAR FROM up.purchase_date)::int as yr,
            EXTRACT(MONTH FROM up.purchase_date)::int as mo,
            COALESCE(SUM(p.price), 0) as revenue,
            COUNT(*) as packages_sold
          FROM user_packages up JOIN packages p ON up.package_id = p.id
          WHERE up.purchase_date >= $1
          GROUP BY yr, mo ORDER BY yr, mo
        `,
          [sixMonthsAgoStart],
        ),
        // 15. Package breakdown
        pool.query(`
          SELECT p.name, p.price, p.sessions_included,
            COUNT(up.id) as sold,
            COALESCE(SUM(p.price), 0) as total_revenue
          FROM packages p
          LEFT JOIN user_packages up ON up.package_id = p.id
          WHERE p.is_active = true
          GROUP BY p.id, p.name, p.price, p.sessions_included
          ORDER BY sold DESC, total_revenue DESC
        `),
        // 16. Completed-class booking totals (for $40/person revenue calc)
        pool.query(
          `
          SELECT
            COUNT(b.id) FILTER (
              WHERE c.date < CURRENT_DATE
                 OR (c.date = CURRENT_DATE AND c.start_time <= CURRENT_TIME)
            ) as total_completed_bookings,
            COUNT(b.id) FILTER (
              WHERE (c.date < CURRENT_DATE OR (c.date = CURRENT_DATE AND c.start_time <= CURRENT_TIME))
                AND c.date >= $1
            ) as monthly_completed_bookings,
            COUNT(b.id) FILTER (
              WHERE (c.date < CURRENT_DATE OR (c.date = CURRENT_DATE AND c.start_time <= CURRENT_TIME))
                AND c.date >= $2 AND c.date < $3
            ) as last_month_completed_bookings
          FROM bookings b
          JOIN classes c ON b.class_id = c.id
        `,
          [startOfMonth, startOfLastMonth, endOfLastMonth],
        ),
        // 17. Completed-class bookings by month (for chart)
        pool.query(
          `
          SELECT
            EXTRACT(YEAR FROM c.date)::int as yr,
            EXTRACT(MONTH FROM c.date)::int as mo,
            COUNT(b.id) as bookings
          FROM bookings b
          JOIN classes c ON b.class_id = c.id
          WHERE (c.date < CURRENT_DATE OR (c.date = CURRENT_DATE AND c.start_time <= CURRENT_TIME))
            AND c.date >= $1
          GROUP BY yr, mo ORDER BY yr, mo
        `,
          [sixMonthsAgoStart],
        ),
      ]);

      // ---- Build 6-month label array ----
      const fullDayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
        return { key, label };
      });

      const mkMonthMap = (
        rows: { yr: number; mo: number; [k: string]: unknown }[],
        valKey: string,
      ) =>
        new Map(
          rows.map((r) => [
            `${r.yr}-${String(r.mo).padStart(2, "0")}`,
            r[valKey] as string,
          ]),
        );

      // ---- CLASS DATA ----
      const csRow = classStatsResult.rows[0];
      const totalClasses = parseInt(csRow.total);
      const upcomingClasses = parseInt(csRow.upcoming);
      const pastClasses = parseInt(csRow.past);

      const frRow = fillRateResult.rows[0];
      const avgFillRate = parseFloat(frRow.avg_fill_rate) || 0;
      const pastFillRate = parseFloat(frRow.past_fill_rate) || 0;

      const totalBookings = parseInt(totalBookingsResult.rows[0].count);

      const classTypeDistribution = classTypesResult.rows.map((r) => ({
        type: r.class_type as string,
        count: parseInt(r.count),
      }));

      const popularTimes = popularTimesResult.rows.map((r) => {
        const h = parseInt(r.hour);
        return {
          time:
            h === 0
              ? "12 AM"
              : h < 12
                ? `${h} AM`
                : h === 12
                  ? "12 PM"
                  : `${h - 12} PM`,
          count: parseInt(r.count),
        };
      });

      const weeklyClassSchedule = fullDayNames
        .map((day, i) => {
          const row = weeklyScheduleResult.rows.find(
            (r) => parseInt(r.day_num) === i,
          );
          return { day, classes: row ? parseInt(row.count) : 0 };
        })
        .filter((d) => d.classes > 0);

      const cbmMap = mkMonthMap(classesByMonthResult.rows, "count");
      const classesByMonth = last6Months.map(({ key, label }) => ({
        month: label,
        count: parseInt((cbmMap.get(key) as string) || "0"),
      }));

      const bbmMap = mkMonthMap(bookingsByMonthResult.rows, "count");
      const bookingsByMonth = last6Months.map(({ key, label }) => ({
        month: label,
        bookings: parseInt((bbmMap.get(key) as string) || "0"),
      }));

      // ---- CLIENT DATA ----
      const usRow = userStatsResult.rows[0];
      const totalUsers = parseInt(usRow.total);
      const activeUsers = parseInt(usRow.active_users);
      const newUsersThisMonth = parseInt(usRow.new_this_month);
      const lastMonthNewUsers = parseInt(usRow.last_month_new);
      const userGrowthRate =
        lastMonthNewUsers > 0
          ? ((newUsersThisMonth - lastMonthNewUsers) / lastMonthNewUsers) * 100
          : 0;

      const topClients = topClientsResult.rows.map((r) => ({
        name:
          (r.name as string) || (r.email as string)?.split("@")[0] || "Unknown",
        email: r.email as string,
        bookings: parseInt(r.booking_count),
        lastClassDate: r.last_class_date
          ? new Date(r.last_class_date as string).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "N/A",
      }));

      const bookingPatterns = fullDayNames.map((day, i) => {
        const row = bookingPatternResult.rows.find(
          (r) => parseInt(r.day_num) === i,
        );
        return { day, bookings: row ? parseInt(row.count) : 0 };
      });

      const ubmMap = mkMonthMap(usersByMonthResult.rows, "count");
      const usersByMonth = last6Months.map(({ key, label }) => ({
        month: label,
        count: parseInt((ubmMap.get(key) as string) || "0"),
      }));

      // ---- REVENUE DATA ----
      const rsRow = revenueStatsResult.rows[0];
      const totalRevenue = parseFloat(rsRow.total_revenue);
      const monthlyRevenue = parseFloat(rsRow.monthly_revenue);
      const lastMonthRevenue = parseFloat(rsRow.last_month_revenue);
      const packagesSold = parseInt(rsRow.total_packages_sold);
      const revenueGrowth =
        lastMonthRevenue > 0
          ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : 0;
      const averageOrderValue =
        packagesSold > 0 ? totalRevenue / packagesSold : 0;

      const rbmMap = mkMonthMap(revenueByMonthResult.rows, "revenue");
      const revenueByMonth = last6Months.map(({ key, label }) => ({
        month: label,
        amount: parseFloat((rbmMap.get(key) as string) || "0"),
      }));

      const packageBreakdown = packageBreakdownResult.rows.map((r) => ({
        name: r.name as string,
        price: parseFloat(r.price),
        sessionsIncluded: parseInt(r.sessions_included),
        sold: parseInt(r.sold),
        revenue: parseFloat(r.total_revenue),
      }));

      // ---- CLASS REVENUE DATA ($40/person, 25% gym cost) ----
      const crsRow = classRevenueStatsResult.rows[0];
      const completedBookings = parseInt(crsRow.total_completed_bookings);
      const monthlyCompletedBookings = parseInt(
        crsRow.monthly_completed_bookings,
      );
      const lastMonthCompletedBookings = parseInt(
        crsRow.last_month_completed_bookings,
      );

      const classGross = completedBookings * CLASS_RATE;
      const classGymCost = Math.round(classGross * GYM_PCT * 100) / 100;
      const classNet = Math.round(classGross * (1 - GYM_PCT) * 100) / 100;

      const monthlyClassGross = monthlyCompletedBookings * CLASS_RATE;
      const monthlyClassGymCost =
        Math.round(monthlyClassGross * GYM_PCT * 100) / 100;
      const monthlyClassNet =
        Math.round(monthlyClassGross * (1 - GYM_PCT) * 100) / 100;

      const lastMonthClassGross = lastMonthCompletedBookings * CLASS_RATE;
      const lastMonthClassNet =
        Math.round(lastMonthClassGross * (1 - GYM_PCT) * 100) / 100;
      const classRevenueGrowth =
        lastMonthClassNet > 0
          ? Math.round(
              ((monthlyClassNet - lastMonthClassNet) / lastMonthClassNet) *
                1000,
            ) / 10
          : 0;

      const crbmMap = mkMonthMap(classRevenueByMonthResult.rows, "bookings");
      const classRevenueByMonth = last6Months.map(({ key, label }) => {
        const bkgs = parseInt((crbmMap.get(key) as string) || "0");
        const gross = bkgs * CLASS_RATE;
        const gymCost = Math.round(gross * GYM_PCT * 100) / 100;
        const net = Math.round(gross * (1 - GYM_PCT) * 100) / 100;
        return { month: label, bookings: bkgs, gross, gymCost, net };
      });

      res.status(200).json({
        classes: {
          totalClasses,
          upcomingClasses,
          pastClasses,
          totalBookings,
          averageCapacity:
            totalClasses > 0
              ? Math.round((totalBookings / totalClasses) * 10) / 10
              : 0,
          completedClasses: pastClasses,
          avgFillRate,
          pastFillRate,
          classTypeDistribution,
          popularTimes,
          classesByMonth,
          bookingsByMonth,
          weeklyClassSchedule,
        },
        clients: {
          totalUsers,
          activeUsers,
          newUsersThisMonth,
          userGrowthRate: Math.round(userGrowthRate * 10) / 10,
          bookingPatterns,
          usersByMonth,
          topClients,
        },
        revenue: {
          totalRevenue,
          monthlyRevenue,
          revenueGrowth: Math.round(revenueGrowth * 10) / 10,
          packagesSold,
          averageOrderValue: Math.round(averageOrderValue * 100) / 100,
          revenueByMonth,
          packageBreakdown,
          classGross,
          classGymCost,
          classNet,
          monthlyClassGross,
          monthlyClassGymCost,
          monthlyClassNet,
          classRevenueGrowth,
          classRevenueByMonth,
          completedBookings,
        },
      });
    } catch (queryError) {
      throw queryError;
    }
  } catch (error) {
    console.error("Analytics API error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
