import { google } from "googleapis";
import { getToken } from "next-auth/jwt";

interface CalendarEventData {
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: "email" | "popup";
      minutes: number;
    }>;
  };
}

interface ClassData {
  id: string;
  title: string;
  description: string;
  instructor: string;
  date: string | Date; // Make date flexible to handle both string and Date inputs
  start_time: string;
  end_time: string;
  location: string;
  class_type: string;
  difficulty_level: string;
}

/**
 * Creates a Google Calendar API client using the user's access token
 */
export async function createCalendarClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + "/api/auth/callback/google"
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

/**
 * Converts class data to Google Calendar event format
 */
export function classToCalendarEvent(classData: ClassData): CalendarEventData {
  // Debug logging to understand what we're receiving
  console.log("🔍 classToCalendarEvent received:", {
    date: classData.date,
    dateType: typeof classData.date,
    isDate: classData.date instanceof Date,
    title: classData.title,
  });

  // Parse the date to handle both string and Date object inputs
  let dateStr: string;
  try {
    if (typeof classData.date === "string") {
      // Handle string input
      if (classData.date.includes("T")) {
        dateStr = classData.date.split("T")[0]; // Get "2025-10-07" from ISO string
      } else {
        dateStr = classData.date; // Already in YYYY-MM-DD format
      }
    } else {
      // Handle Date object or other date-like objects
      const dateObj = new Date(classData.date);
      if (isNaN(dateObj.getTime())) {
        throw new Error(`Invalid date received: ${classData.date}`);
      }
      dateStr = dateObj.toISOString().split("T")[0]; // Convert to ISO string and extract date
    }

    console.log("📅 Parsed date string:", dateStr);
  } catch (error) {
    console.error("❌ Date parsing error:", error);
    throw new Error(`Failed to parse class date: ${classData.date}`);
  }

  return {
    summary: `${classData.title} - Fitness Class`,
    description: `${classData.description}\n\nInstructor: ${classData.instructor}\nDifficulty: ${classData.difficulty_level}\nClass Type: ${classData.class_type}`,
    location: classData.location,
    start: {
      dateTime: `${dateStr}T${classData.start_time}:00`,
      timeZone: "America/New_York", // EST/EDT
    },
    end: {
      dateTime: `${dateStr}T${classData.end_time}:00`,
      timeZone: "America/New_York",
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 }, // 24 hours before
        { method: "popup", minutes: 60 }, // 1 hour before
        { method: "popup", minutes: 15 }, // 15 minutes before
      ],
    },
  };
}

/**
 * Creates a calendar event for a booked class
 */
export async function createCalendarEvent(
  accessToken: string,
  classData: ClassData
): Promise<string | null> {
  try {
    const calendar = await createCalendarClient(accessToken);
    const eventData = classToCalendarEvent(classData);

    console.log("📅 Creating Google Calendar event:", {
      summary: eventData.summary,
      start: eventData.start,
      end: eventData.end,
    });

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: eventData,
    });

    if (response.data.id) {
      console.log("✅ Calendar event created successfully:", response.data.id);
      return response.data.id;
    } else {
      console.error("❌ Failed to create calendar event: No event ID returned");
      return null;
    }
  } catch (error: any) {
    console.error("❌ Error creating calendar event:", error);

    // Handle specific Google API errors
    if (error.code === 401) {
      throw new Error("Calendar access expired. Please re-authenticate.");
    } else if (error.code === 403) {
      throw new Error(
        "Calendar access denied. Please grant calendar permissions."
      );
    } else {
      throw new Error("Failed to create calendar event. Please try again.");
    }
  }
}

/**
 * Updates an existing calendar event
 */
export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  classData: ClassData
): Promise<boolean> {
  try {
    const calendar = await createCalendarClient(accessToken);
    const eventData = classToCalendarEvent(classData);

    console.log("📅 Updating Google Calendar event:", eventId);

    const response = await calendar.events.update({
      calendarId: "primary",
      eventId: eventId,
      requestBody: eventData,
    });

    if (response.data.id) {
      console.log("✅ Calendar event updated successfully:", response.data.id);
      return true;
    } else {
      console.error("❌ Failed to update calendar event");
      return false;
    }
  } catch (error: any) {
    console.error("❌ Error updating calendar event:", error);

    if (error.code === 401) {
      throw new Error("Calendar access expired. Please re-authenticate.");
    } else if (error.code === 403) {
      throw new Error(
        "Calendar access denied. Please grant calendar permissions."
      );
    } else if (error.code === 404) {
      throw new Error("Calendar event not found. It may have been deleted.");
    } else {
      throw new Error("Failed to update calendar event. Please try again.");
    }
  }
}

/**
 * Deletes a calendar event when a booking is cancelled
 */
export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<boolean> {
  try {
    const calendar = await createCalendarClient(accessToken);

    console.log("🗑️ Deleting Google Calendar event:", eventId);

    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    });

    console.log("✅ Calendar event deleted successfully");
    return true;
  } catch (error: any) {
    console.error("❌ Error deleting calendar event:", error);

    if (error.code === 401) {
      throw new Error("Calendar access expired. Please re-authenticate.");
    } else if (error.code === 403) {
      throw new Error(
        "Calendar access denied. Please grant calendar permissions."
      );
    } else if (error.code === 404) {
      // Event already deleted or doesn't exist - this is OK
      console.log("ℹ️ Calendar event not found (may already be deleted)");
      return true;
    } else {
      throw new Error("Failed to delete calendar event. Please try again.");
    }
  }
}

/**
 * Checks if the user has granted calendar permissions
 */
export async function hasCalendarPermissions(
  accessToken: string
): Promise<boolean> {
  try {
    const calendar = await createCalendarClient(accessToken);

    // Try to access the user's calendar list
    await calendar.calendarList.list({
      maxResults: 1,
    });

    return true;
  } catch (error: any) {
    console.log("ℹ️ Calendar permissions check failed:", error.message);
    return false;
  }
}

/**
 * Gets the user's access token from the request (for API routes)
 */
export async function getUserAccessToken(req: any): Promise<string | null> {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // The access token should be stored in the JWT token
    return (token?.accessToken as string) || null;
  } catch (error) {
    console.error("❌ Error getting user access token:", error);
    return null;
  }
}

/**
 * Gets the user's access token from the session (for client-side)
 */
export function getAccessTokenFromSession(session: any): string | null {
  return session?.accessToken || null;
}
