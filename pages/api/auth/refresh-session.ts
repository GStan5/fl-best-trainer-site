import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Force session refresh by clearing the cookie
    res.setHeader("Set-Cookie", [
      "next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax",
      "__Secure-next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax",
    ]);

    return res.status(200).json({
      success: true,
      message:
        "Session cleared. Please sign in again to get calendar permissions.",
    });
  } catch (error) {
    console.error("Error clearing session:", error);
    return res.status(500).json({ error: "Failed to clear session" });
  }
}
