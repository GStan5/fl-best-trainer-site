import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import jsPDF from "jspdf";
import { Readable } from "stream";
import { Pool } from "pg";
import sql from "../../lib/database";

interface WaiverBody {
  name: string;
  email: string;
  phone: string; // Now required
  signature: string;
  signatureType: "draw" | "type";
  date: string;
}

const getClientIP = (req: NextApiRequest): string => {
  // Try various headers for getting the real client IP
  const forwarded = req.headers["x-forwarded-for"];
  const realIP = req.headers["x-real-ip"];
  const cloudflareIP = req.headers["cf-connecting-ip"];

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return Array.isArray(realIP) ? realIP[0] : realIP;
  }

  if (cloudflareIP) {
    return Array.isArray(cloudflareIP) ? cloudflareIP[0] : cloudflareIP;
  }

  // Fallback to connection remote address
  const connectionIP =
    req.connection?.remoteAddress || req.socket?.remoteAddress;

  // Convert IPv6 localhost to IPv4
  if (connectionIP === "::1" || connectionIP === "::ffff:127.0.0.1") {
    return "127.0.0.1 (localhost)";
  }

  return connectionIP || "Unknown";
};

// Database connection
const getDbPool = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });
};

// Update user's waiver status in database and complete onboarding
const updateUserWaiverStatusAndCompleteOnboarding = async (
  email: string,
  pdfBuffer: Buffer,
  fileName: string
) => {
  try {
    // First try to update with PDF columns, if they don't exist, fall back to basic update
    try {
      console.log(
        `📄 Saving PDF to database - Size: ${pdfBuffer.length} bytes`
      );
      console.log(`📄 Filename: ${fileName}`);

      const result = await sql`
        UPDATE users SET 
          waiver_signed = true, 
          waiver_signed_date = NOW(),
          waiver_pdf_data = ${pdfBuffer},
          waiver_pdf_filename = ${fileName},
          onboarding_completed = true
         WHERE email = ${email}
      `;

      console.log(
        `✅ Updated waiver status with PDF and completed onboarding for user: ${email}`
      );
      console.log(`📄 PDF saved successfully - ${pdfBuffer.length} bytes`);
      return result.length > 0;
    } catch (pdfError) {
      // If PDF columns don't exist, fall back to basic update
      console.log("⚠️ PDF columns not available, using basic update");
      const result = await sql`
        UPDATE users SET 
          waiver_signed = true, 
          waiver_signed_date = NOW(),
          onboarding_completed = true
         WHERE email = ${email}
      `;

      console.log(
        `✅ Updated waiver status and completed onboarding for user: ${email}`
      );
      return result.length > 0;
    }
  } catch (error) {
    console.error(
      "❌ Error updating user waiver status and onboarding:",
      error
    );
    throw error;
  }
};

const saveToGoogleSheets = async (
  data: WaiverBody,
  req: NextApiRequest,
  driveFileId?: string
) => {
  if (
    !process.env.GDRIVE_CLIENT_EMAIL ||
    !process.env.GDRIVE_PRIVATE_KEY ||
    !process.env.GSHEETS_SPREADSHEET_ID
  ) {
    console.log(
      "⚠️ Google Sheets integration not configured - missing environment variables"
    );
    return;
  }

  try {
    console.log("📊 Attempting to save to Google Sheets...");
    console.log("🔍 DEBUG - Environment variables:");
    console.log("  GDRIVE_CLIENT_EMAIL:", process.env.GDRIVE_CLIENT_EMAIL);
    console.log(
      "  GDRIVE_PRIVATE_KEY present:",
      !!process.env.GDRIVE_PRIVATE_KEY
    );
    console.log(
      "  GSHEETS_SPREADSHEET_ID:",
      process.env.GSHEETS_SPREADSHEET_ID
    );

    const auth = new google.auth.JWT(
      process.env.GDRIVE_CLIENT_EMAIL,
      undefined,
      process.env.GDRIVE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    console.log("🔑 JWT auth created successfully");

    const sheets = google.sheets({ version: "v4", auth });
    console.log("📋 Google Sheets client created");

    // Create the waiver link
    const waiverLink = driveFileId
      ? `https://drive.google.com/file/d/${driveFileId}/view`
      : "N/A";

    // Prepare the row data
    const rowData = [
      new Date(data.date).toLocaleDateString(), // Date
      new Date(data.date).toLocaleTimeString(), // Time
      data.name, // Name
      data.email, // Email
      data.phone, // Phone (now required)
      data.signatureType === "draw" ? "Hand-drawn" : "Typed", // Signature Type
      getClientIP(req), // IP Address
      waiverLink, // Waiver Link
      `WAIVER-${Date.now()}`, // Document ID
      "Active", // Status
    ];

    console.log("📋 Spreadsheet ID:", process.env.GSHEETS_SPREADSHEET_ID);
    console.log("📋 Target range: Clients!A:J");
    console.log("📋 Row data to insert:", rowData);

    // Add the row to the spreadsheet
    console.log("📤 Attempting to append row to spreadsheet...");
    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GSHEETS_SPREADSHEET_ID,
      range: "Clients!A:J", // Using "Clients" sheet name
      valueInputOption: "RAW",
      requestBody: {
        values: [rowData],
      },
    });

    console.log(
      `✅ Successfully added waiver data to Google Sheets for ${data.name}`
    );
    console.log(
      "📊 Sheets API response:",
      JSON.stringify(result.data, null, 2)
    );
  } catch (error) {
    console.error("❌ Error saving to Google Sheets:", error);
    if (error instanceof Error) {
      console.error("❌ Error name:", error.name);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error stack:", error.stack);
    }

    // Additional error details for Google API errors
    if (error && typeof error === "object" && "code" in error) {
      console.error("❌ Google API error code:", (error as any).code);
      console.error("❌ Google API error details:", (error as any).errors);
    }
  }
};

const generateWaiverPDF = async (data: WaiverBody, req: NextApiRequest) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 25;
  const lineHeight = 6;
  let yPosition = margin;

  // Color definitions (RGB)
  const royalBlue = [37, 99, 235]; // True blue color (blue-600)
  const darkGray = [45, 45, 45];
  const lightGray = [128, 128, 128];
  const warningRed = [220, 38, 38];

  // Helper function to add a professional header
  const addHeader = (pageNumber: number = 1) => {
    // Header background
    doc.setFillColor(royalBlue[0], royalBlue[1], royalBlue[2]);
    doc.rect(0, 0, pageWidth, 35, "F");

    // Main title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("FL BEST TRAINER", pageWidth / 2, 15, { align: "center" });

    // Subtitle
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("LIABILITY WAIVER & RELEASE OF CLAIMS", pageWidth / 2, 25, {
      align: "center",
    });

    // Page number (if not first page)
    if (pageNumber > 1) {
      doc.setFontSize(10);
      doc.text(`Page ${pageNumber}`, pageWidth - margin, 30, {
        align: "right",
      });
    }
  };

  // Helper function to add footer
  const addFooter = () => {
    const footerY = pageHeight - 20;
    doc.setFillColor(245, 245, 245);
    doc.rect(0, footerY - 5, pageWidth, 25, "F");

    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Gavin R. Stanifer d/b/a FL Best Trainer", margin, footerY + 5);
    doc.text(
      `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      pageWidth - margin,
      footerY + 5,
      { align: "right" }
    );
  };

  // Add header to first page
  addHeader(1);
  yPosition = 45;

  // Document date and ID
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Document Date: ${new Date(data.date).toLocaleDateString()}`,
    margin,
    yPosition
  );
  doc.text(`Document ID: WAIVER-${Date.now()}`, pageWidth - margin, yPosition, {
    align: "right",
  });
  yPosition += lineHeight * 2;

  // Participant Information Section
  doc.setFillColor(250, 250, 250);
  doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 35, "F");

  doc.setTextColor(royalBlue[0], royalBlue[1], royalBlue[2]);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PARTICIPANT INFORMATION", margin, yPosition + 5);
  yPosition += lineHeight * 2;

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  // Create two columns for participant info
  const col1X = margin;
  const col2X = pageWidth / 2 + 10;

  doc.text(`Name: ${data.name}`, col1X, yPosition);
  doc.text(`Email: ${data.email}`, col1X, yPosition + lineHeight);
  doc.text(`Phone: ${data.phone}`, col2X, yPosition);
  doc.text(`IP Address: ${getClientIP(req)}`, col2X, yPosition + lineHeight);
  yPosition += lineHeight * 4;

  // Warning Box
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(239, 68, 68);
  doc.rect(margin - 5, yPosition - 3, pageWidth - 2 * margin + 10, 20, "FD");

  doc.setTextColor(warningRed[0], warningRed[1], warningRed[2]);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("IMPORTANT LEGAL NOTICE", pageWidth / 2, yPosition + 3, {
    align: "center",
  });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    "READ CAREFULLY - THIS DOCUMENT AFFECTS YOUR LEGAL RIGHTS",
    pageWidth / 2,
    yPosition + 10,
    { align: "center" }
  );
  yPosition += lineHeight * 4;

  // Main waiver content
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const introText = `I, ${data.name}, in consideration for being permitted to participate in personal training services, fitness instruction, and related activities provided by Gavin R. Stanifer, doing business as "FL Best Trainer" (collectively referred to as "Provider"), acknowledge, understand, and agree to the following terms and conditions:`;

  const splitIntro = doc.splitTextToSize(introText, pageWidth - 2 * margin);
  splitIntro.forEach((line: string) => {
    if (yPosition > pageHeight - 60) {
      addFooter();
      doc.addPage();
      addHeader(2);
      yPosition = 45;
    }
    doc.text(line, margin, yPosition);
    yPosition += lineHeight;
  });
  yPosition += lineHeight;

  // Waiver sections with professional formatting
  const waiverSections = [
    {
      title: "1. ASSUMPTION OF RISK",
      content:
        "I understand and acknowledge that physical exercise, fitness training, and related activities involve inherent risks of physical injury, including but not limited to: muscle strains, sprains, tears, broken bones, heart attack, stroke, heat exhaustion, dehydration, and in extreme cases, permanent disability or death. I voluntarily assume all such risks and hazards incidental to such participation for myself and (if applicable) my minor child.",
    },
    {
      title: "2. PHYSICAL CONDITION",
      content:
        "I represent and warrant that I am in good physical condition and have no medical condition, impairment, disease, infirmity, or other illness that would prevent my participation or use of equipment or that would increase my risk of injury or adverse health consequences. I acknowledge that Provider has recommended that I consult with a physician before beginning any exercise program.",
    },
    {
      title: "3. RELEASE AND WAIVER",
      content:
        'I, for myself and my heirs, assigns, personal representatives, and next of kin, HEREBY RELEASE, WAIVE, DISCHARGE, AND COVENANT NOT TO SUE Gavin R. Stanifer, FL Best Trainer, and their respective officers, directors, employees, agents, contractors, and representatives (collectively "Released Parties") from any and all liability, claims, demands, losses, or damages on my account caused or alleged to be caused in whole or in part by the negligence of the Released Parties or otherwise, including negligent rescue operations.',
    },
    {
      title: "4. INDEMNIFICATION",
      content:
        "I agree to indemnify and hold harmless the Released Parties from any loss, liability, damage, or cost they may incur arising out of or related to my participation in activities, whether caused by my own actions or inactions, those of others participating in the activity, the conditions in which the activities take place, or the negligence of the Released Parties.",
    },
    {
      title: "5. MEDICAL TREATMENT",
      content:
        "I consent to receive medical treatment that may be deemed advisable in the event of injury, accident, and/or illness during participation. I understand and agree that I am solely responsible for all costs related to medical treatment and transportation.",
    },
    {
      title: "6. MEDIA RELEASE",
      content:
        "I grant to the Released Parties the irrevocable right and permission to photograph, videotape, or otherwise record my participation and to use such recordings for promotional, educational, or commercial purposes without compensation to me.",
    },
    {
      title: "7. EQUIPMENT USE",
      content:
        "I acknowledge that I am responsible for inspecting any equipment before use and will immediately report any unsafe conditions. I will use equipment only as instructed and within my capabilities.",
    },
    {
      title: "8. SEVERABILITY",
      content:
        "If any provision of this agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.",
    },
    {
      title: "9. GOVERNING LAW",
      content:
        "This agreement shall be governed by the laws of the State of Florida. Any disputes arising under this agreement shall be resolved exclusively in the courts of Florida, and I consent to the jurisdiction of such courts.",
    },
    {
      title: "10. ENTIRE AGREEMENT",
      content:
        "This document constitutes the entire agreement between the parties and supersedes any prior understandings or agreements.",
    },
  ];

  waiverSections.forEach((section) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      addFooter();
      doc.addPage();
      addHeader(2);
      yPosition = 45;
    }

    // Section title
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(royalBlue[0], royalBlue[1], royalBlue[2]);
    doc.text(section.title, margin, yPosition);
    yPosition += lineHeight;

    // Section content
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    const splitContent = doc.splitTextToSize(
      section.content,
      pageWidth - 2 * margin
    );
    splitContent.forEach((line: string) => {
      if (yPosition > pageHeight - 60) {
        addFooter();
        doc.addPage();
        addHeader(2);
        yPosition = 45;
      }
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
    yPosition += lineHeight;
  });

  // Final acknowledgment
  if (yPosition > pageHeight - 100) {
    addFooter();
    doc.addPage();
    addHeader(2);
    yPosition = 45;
  }

  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(239, 68, 68);
  doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 25, "FD");

  doc.setTextColor(warningRed[0], warningRed[1], warningRed[2]);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("ACKNOWLEDGMENT", pageWidth / 2, yPosition + 3, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const acknowledgmentText =
    "I HAVE READ THIS AGREEMENT, FULLY UNDERSTAND ITS TERMS, UNDERSTAND THAT I AM GIVING UP SUBSTANTIAL RIGHTS INCLUDING MY RIGHT TO SUE, AND HAVE SIGNED IT FREELY AND WITHOUT ANY INDUCEMENT OR ASSURANCE OF ANY NATURE.";
  const splitAck = doc.splitTextToSize(
    acknowledgmentText,
    pageWidth - 2 * margin
  );
  let ackY = yPosition + 8;
  splitAck.forEach((line: string) => {
    doc.text(line, pageWidth / 2, ackY, { align: "center" });
    ackY += lineHeight * 0.8;
  });
  yPosition += lineHeight * 6;

  // Signature section with professional styling
  if (yPosition > pageHeight - 120) {
    addFooter();
    doc.addPage();
    addHeader(2);
    yPosition = 45;
  }

  // Signature box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(royalBlue[0], royalBlue[1], royalBlue[2]);
  doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 80, "FD");

  doc.setTextColor(royalBlue[0], royalBlue[1], royalBlue[2]);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(
    "ELECTRONIC SIGNATURE & VERIFICATION",
    pageWidth / 2,
    yPosition + 5,
    { align: "center" }
  );
  yPosition += lineHeight * 2;

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  // Signature method
  doc.text(
    `Signature Method: ${
      data.signatureType === "draw"
        ? "Hand-drawn Electronic Signature"
        : "Typed Electronic Signature"
    }`,
    margin,
    yPosition
  );
  yPosition += lineHeight * 1.5;

  // Add signature
  if (
    data.signatureType === "draw" &&
    data.signature.startsWith("data:image/")
  ) {
    try {
      doc.setFont("helvetica", "bold");
      doc.text("Electronic Signature:", margin, yPosition);
      yPosition += lineHeight;

      // Add signature with border
      const sigX = margin + 10;
      const sigY = yPosition;
      const sigWidth = 120;
      const sigHeight = 35;

      doc.setDrawColor(200, 200, 200);
      doc.rect(sigX - 2, sigY - 2, sigWidth + 4, sigHeight + 4, "D");
      doc.addImage(data.signature, "PNG", sigX, sigY, sigWidth, sigHeight);

      yPosition += sigHeight + lineHeight;
      doc.setFont("helvetica", "normal");
      doc.text(`Digitally signed by: ${data.name}`, margin, yPosition);
    } catch (error) {
      doc.text(
        "Electronic Signature: [Hand-drawn signature image captured]",
        margin,
        yPosition
      );
      yPosition += lineHeight;
      doc.text(`Signed by: ${data.name}`, margin, yPosition);
    }
  } else {
    doc.setFont("helvetica", "bold");
    doc.text("Electronic Signature:", margin, yPosition);
    yPosition += lineHeight;

    // Signature box for typed signature
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin + 10, yPosition - 5, 120, 20, "D");

    doc.setFont("times", "italic");
    doc.setFontSize(16);
    doc.text(data.signature, margin + 15, yPosition + 5);

    yPosition += lineHeight * 3;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      "(Typed name constitutes legal electronic signature under E-SIGN Act)",
      margin,
      yPosition
    );
  }

  yPosition += lineHeight * 2;

  // Verification details in two columns
  const verificationDetails = [
    {
      label: "Date & Time:",
      value: `${new Date(data.date).toLocaleDateString()} at ${new Date(
        data.date
      ).toLocaleTimeString()}`,
    },
    { label: "Client IP:", value: getClientIP(req) },
    { label: "Document ID:", value: `WAIVER-${Date.now()}` },
    {
      label: "Legal Status:",
      value: "Electronically signed - legally binding",
    },
  ];

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  verificationDetails.forEach((detail, index) => {
    if (index % 2 === 0) {
      doc.setFont("helvetica", "bold");
      doc.text(detail.label, margin, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(detail.value, margin + 30, yPosition);
    } else {
      doc.setFont("helvetica", "bold");
      doc.text(detail.label, pageWidth / 2 + 10, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(detail.value, pageWidth / 2 + 35, yPosition);
      yPosition += lineHeight;
    }
  });

  // Add footer to last page
  addFooter();

  return doc.output("arraybuffer");
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { name, email, phone, signature, signatureType, date } =
    req.body as WaiverBody;
  if (!name || !email || !phone || !signature) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Generate PDF
    const pdfArrayBuffer = await generateWaiverPDF(req.body, req);
    const pdfBuffer = Buffer.from(pdfArrayBuffer);
    const pdfBase64 = pdfBuffer.toString("base64");

    // Send emails with PDF attachment
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const fileName = `FL_Best_Trainer_Waiver_${name.replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;

    // Send email to business owner
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `🏋️ New Liability Waiver Signed - ${name}`,
      html: `
        <h2>New Liability Waiver Signed</h2>
        <p><strong>Participant:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Signature Type:</strong> ${
          signatureType === "draw"
            ? "Hand-drawn electronic signature"
            : "Typed electronic signature"
        }</p>
        <p><strong>Date Signed:</strong> ${new Date(date).toLocaleString()}</p>
        <p><strong>IP Address:</strong> ${getClientIP(req)}</p>
        
        <p>The complete signed waiver is attached as a PDF with ${
          signatureType === "draw"
            ? "the actual signature image embedded"
            : "typed signature confirmation"
        }.</p>
        
        <hr>
        <p><small>FL Best Trainer - Automated Waiver System</small></p>
      `,
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
          encoding: "base64",
          contentType: "application/pdf",
        },
      ],
    });

    // Send confirmation email to participant
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "FL Best Trainer - Liability Waiver Confirmation",
      html: `
        <h2>Thank you for signing the liability waiver!</h2>
        <p>Hi ${name},</p>
        <p>This email confirms that you have successfully signed the liability waiver for FL Best Trainer (Gavin R. Stanifer).</p>
        
        <p><strong>Details:</strong></p>
        <ul>
          <li>Name: ${name}</li>
          <li>Email: ${email}</li>
          <li>Phone: ${phone}</li>
          <li>Date Signed: ${new Date(date).toLocaleString()}</li>
          <li>Signature Type: ${
            signatureType === "draw" ? "Hand-drawn" : "Typed"
          }</li>
        </ul>
        
        <p>A copy of your complete signed waiver is attached to this email for your records. This is a legally binding document.</p>

        <p>I look forward to working with you, and helping you achieve your fitness goals!</p>

        <p>Best regards,<br>
        Gavin R. Stanifer<br>
        FL Best Trainer<br>
        www.FLBestTrainer.com</p>

        <hr>
        <p><small>Questions? Reply to this email or contact us through our website.</small></p>
      `,
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
          encoding: "base64",
          contentType: "application/pdf",
        },
      ],
    });

    // Save to Google Drive if configured
    let driveFileId: string | undefined;
    if (
      process.env.GDRIVE_CLIENT_EMAIL &&
      process.env.GDRIVE_PRIVATE_KEY &&
      process.env.GDRIVE_FOLDER_ID
    ) {
      try {
        const auth = new google.auth.JWT(
          process.env.GDRIVE_CLIENT_EMAIL,
          undefined,
          process.env.GDRIVE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          [
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/spreadsheets",
          ]
        );
        const drive = google.drive({ version: "v3", auth });

        // Create a readable stream from the PDF buffer
        const pdfStream = new Readable({
          read() {
            this.push(Buffer.from(pdfBuffer));
            this.push(null);
          },
        });

        const driveResponse = await drive.files.create({
          requestBody: {
            name: fileName,
            parents: [process.env.GDRIVE_FOLDER_ID],
          },
          media: {
            mimeType: "application/pdf",
            body: pdfStream,
          },
        });

        driveFileId = driveResponse.data.id || undefined;
        console.log(`💾 Successfully saved to Google Drive: ${driveFileId}`);
      } catch (driveError) {
        console.warn(
          "⚠️ Failed to save to Google Drive (continuing anyway):",
          driveError
        );
        driveFileId = undefined;
      }
    }

    // Save to Google Sheets (non-critical - don't fail if this errors)
    try {
      await saveToGoogleSheets(req.body, req, driveFileId);
    } catch (sheetsError) {
      console.warn(
        "⚠️ Failed to save to Google Sheets (continuing anyway):",
        sheetsError
      );
    }

    // Update user's waiver status in database and complete onboarding
    try {
      await updateUserWaiverStatusAndCompleteOnboarding(
        email,
        pdfBuffer,
        fileName
      );
    } catch (dbError) {
      console.warn(
        "⚠️ Failed to update user waiver status in database (continuing anyway):",
        dbError
      );
    }

    console.log(`✅ Waiver submitted successfully for ${name}`);
    console.log(
      `📧 Emails sent with ${
        signatureType === "draw"
          ? "embedded signature image"
          : "typed signature"
      }`
    );
    console.log(`🌐 Client IP: ${getClientIP(req)}`);
    console.log(`📄 PDF generated: ${fileName}`);
    console.log(`💾 Google Drive file ID: ${driveFileId || "N/A"}`);
    console.log(`📊 Google Sheets updated with client info`);

    return res
      .status(200)
      .json({ success: true, message: "Waiver submitted successfully" });
  } catch (err) {
    console.error("Error processing waiver:", err);
    return res.status(500).json({ error: "Failed to submit waiver" });
  }
}
