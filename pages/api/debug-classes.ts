import type { NextApiRequest, NextApiResponse } from "next";
import sql from "../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const classes = await sql`
      SELECT 
        id,
        title,
        date,
        start_time,
        is_active
      FROM classes 
      WHERE is_active = true
      ORDER BY date ASC, start_time ASC
    `;

    console.log("Debug - All active classes:");
    classes.forEach((classItem) => {
      const jsDate = new Date(classItem.date);
      const estDate = new Date(
        jsDate.getFullYear(),
        jsDate.getMonth(),
        jsDate.getDate()
      );

      console.log(`- ${classItem.title} on ${classItem.date}`);
      console.log(
        `  JS Date: ${jsDate} (Month: ${jsDate.getMonth()}, Year: ${jsDate.getFullYear()})`
      );
      console.log(
        `  EST Date: ${estDate} (Month: ${estDate.getMonth()}, Year: ${estDate.getFullYear()})`
      );
    });

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    console.log(`Current month: ${currentMonth}, Current year: ${currentYear}`);

    res.status(200).json({
      success: true,
      currentMonth,
      currentYear,
      data: classes.map((classItem) => ({
        ...classItem,
        jsDate: new Date(classItem.date),
        estDate: new Date(
          new Date(classItem.date).getFullYear(),
          new Date(classItem.date).getMonth(),
          new Date(classItem.date).getDate()
        ),
      })),
    });
  } catch (error) {
    console.error("Debug classes error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to debug classes",
    });
  }
}
