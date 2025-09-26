import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import sql from "../../../../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Check if user is admin (customize this logic as needed)
    const isAdmin =
      session.user.email === "gavinstanifer@live.com" ||
      session.user.email === "gavinstaniferengineering@gmail.com";

    if (!isAdmin) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    if (req.method !== "GET") {
      return res
        .status(405)
        .json({ success: false, error: "Method not allowed" });
    }

    const { clientId } = req.query;

    if (!clientId || typeof clientId !== "string") {
      return res
        .status(400)
        .json({ success: false, error: "Client ID is required" });
    }

    console.log("Fetching waiver for client:", clientId);

    // Fetch the waiver data for the client
    let result;
    try {
      result = await sql`
        SELECT 
          waiver_signed,
          waiver_signed_date,
          first_name,
          last_name,
          email,
          waiver_pdf_data,
          waiver_pdf_filename
        FROM users 
        WHERE id = ${clientId}
      `;
    } catch (dbError) {
      console.error("Database error - trying without PDF columns:", dbError);
      // Try without PDF columns in case they don't exist
      result = await sql`
        SELECT 
          waiver_signed,
          waiver_signed_date,
          first_name,
          last_name,
          email
        FROM users 
        WHERE id = ${clientId}
      `;
    }

    console.log(
      "Database result:",
      result.length > 0 ? "Client found" : "Client not found"
    );

    if (result.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Client not found" });
    }

    const client = result[0];
    console.log("Client waiver status:", {
      waiver_signed: client.waiver_signed,
      has_pdf_data: !!client.waiver_pdf_data,
      pdf_filename: client.waiver_pdf_filename,
    });

    if (!client.waiver_signed) {
      return res
        .status(400)
        .json({ success: false, error: "Client has not signed waiver" });
    }

    // If we have PDF data stored in the database
    if (client.waiver_pdf_data) {
      let base64Data;
      try {
        console.log("PDF data type:", typeof client.waiver_pdf_data);
        console.log("PDF data length:", client.waiver_pdf_data.length);
        console.log("Is Buffer?", Buffer.isBuffer(client.waiver_pdf_data));

        // Handle both Buffer and string cases
        if (Buffer.isBuffer(client.waiver_pdf_data)) {
          base64Data = client.waiver_pdf_data.toString("base64");
        } else if (typeof client.waiver_pdf_data === "string") {
          base64Data = client.waiver_pdf_data;
        } else {
          throw new Error("Invalid PDF data format");
        }

        console.log("Base64 data length:", base64Data.length);
        console.log("Base64 starts with:", base64Data.substring(0, 50));

        return res.status(200).json({
          success: true,
          waiverData: base64Data,
          filename: client.waiver_pdf_filename || "waiver.pdf",
          signedDate: client.waiver_signed_date,
          clientName: `${client.first_name} ${client.last_name}`,
          clientEmail: client.email,
        });
      } catch (error) {
        console.error("Error processing PDF data:", error);
        // Fall through to the no-PDF case
      }
    }

    // If no PDF data is stored, we'll generate a simple waiver document or show message
    return res.status(200).json({
      success: true,
      waiverData: null,
      message: "Waiver was signed but PDF data is not available",
      signedDate: client.waiver_signed_at,
      clientName: `${client.first_name} ${client.last_name}`,
      clientEmail: client.email,
    });
  } catch (error) {
    console.error("Error fetching waiver:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
