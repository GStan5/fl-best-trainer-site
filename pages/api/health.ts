import type { NextApiRequest, NextApiResponse } from "next";
import sql from "../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Simple query to test database connectivity
    const result = await sql`SELECT 1 as test`;

    if (result.length > 0 && result[0].test === 1) {
      return res.status(200).json({
        status: "healthy",
        database: "connected",
        timestamp: new Date().toISOString(),
      });
    } else {
      throw new Error("Unexpected query result");
    }
  } catch (error: any) {
    console.error("Database health check failed:", error);

    return res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
