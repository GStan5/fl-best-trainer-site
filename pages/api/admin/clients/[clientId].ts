import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import sql from "../../../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Check if user is admin
    const isAdmin =
      session.user.email === "gavinstanifer@live.com" ||
      session.user.email === "gavinstaniferengineering@gmail.com";

    if (!isAdmin) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    const { clientId } = req.query;

    if (req.method === "PUT") {
      // Update client
      const {
        first_name,
        last_name,
        phone,
        address,
        emergency_contact_name,
        emergency_contact_phone,
        waiver_signed,
        onboarding_completed,
      } = req.body;

      if (!first_name || !last_name) {
        return res.status(400).json({
          success: false,
          error: "First name and last name are required",
        });
      }

      const updatedClient = await sql`
        UPDATE users SET 
          name = ${first_name + " " + last_name},
          first_name = ${first_name},
          last_name = ${last_name},
          phone = ${phone || null},
          address = ${address || null},
          emergency_contact_name = ${emergency_contact_name || null},
          emergency_contact_phone = ${emergency_contact_phone || null},
          waiver_signed = ${waiver_signed || false},
          onboarding_completed = ${onboarding_completed || false}
        WHERE id = ${clientId}
        RETURNING *
      `;

      if (updatedClient.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Client not found",
        });
      }

      return res.status(200).json({
        success: true,
        client: updatedClient[0],
      });
    }

    if (req.method === "DELETE") {
      // Delete client
      const deletedClient = await sql`
        DELETE FROM users 
        WHERE id = ${clientId}
        RETURNING id
      `;

      if (deletedClient.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Client not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Client deleted successfully",
      });
    }

    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  } catch (error) {
    console.error("❌ Error in client API:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
