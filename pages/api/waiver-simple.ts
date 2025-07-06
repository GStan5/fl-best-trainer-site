import type { NextApiRequest, NextApiResponse } from "next";
// import nodemailer from "nodemailer";
// import { google } from "googleapis";

interface WaiverBody {
  name: string;
  email: string;
  phone?: string;
  signature: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { name, email, phone, signature } = req.body as WaiverBody;
  if (!name || !email || !signature) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const waiverText = `FL Best Trainer Liability Waiver\n\nName: ${name}\nEmail: ${email}\nPhone: ${
    phone || "Not provided"
  }\nSignature: ${signature}\nDate: ${new Date().toLocaleDateString()}\nTime: ${new Date().toLocaleTimeString()}`;

  // Log the waiver to console for testing
  console.log("=== NEW WAIVER SUBMITTED ===");
  console.log(waiverText);
  console.log("===============================");

  // For now, just return success (you can add email/drive functionality later)
  try {
    // TODO: Uncomment and configure email sending when ready
    /*
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      const transporter = nodemailer.createTransporter({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      // Send email to yourself
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        subject: `New Waiver from ${name}`,
        text: waiverText,
      });

      // Send confirmation email to user
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Copy of your FL Best Trainer waiver",
        text: `Thank you for submitting your waiver!\n\n${waiverText}`,
      });
    }
    */

    // TODO: Uncomment Google Drive integration when ready
    /*
    if (
      process.env.GDRIVE_CLIENT_EMAIL &&
      process.env.GDRIVE_PRIVATE_KEY &&
      process.env.GDRIVE_FOLDER_ID
    ) {
      const auth = new google.auth.JWT(
        process.env.GDRIVE_CLIENT_EMAIL,
        undefined,
        process.env.GDRIVE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        ["https://www.googleapis.com/auth/drive.file"]
      );
      const drive = google.drive({ version: "v3", auth });
      await drive.files.create({
        requestBody: {
          name: `waiver_${name.replace(/\s+/g, '_')}_${Date.now()}.txt`,
          parents: [process.env.GDRIVE_FOLDER_ID],
        },
        media: {
          mimeType: "text/plain",
          body: waiverText,
        },
      });
    }
    */

    return res.status(200).json({
      success: true,
      message: "Waiver submitted successfully (currently logging to console)",
    });
  } catch (err) {
    console.error("Error processing waiver:", err);
    return res.status(500).json({ error: "Failed to submit waiver" });
  }
}
