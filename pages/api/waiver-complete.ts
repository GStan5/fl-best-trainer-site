import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import jsPDF from "jspdf";

interface WaiverBody {
  name: string;
  email: string;
  phone?: string;
  signature: string;
  signatureType: "draw" | "type";
  date: string;
}

const generateWaiverPDF = async (data: WaiverBody, req: NextApiRequest) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("FL Best Trainer - Liability Waiver", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += lineHeight * 2;

  // Date
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Date: ${new Date(data.date).toLocaleDateString()}`,
    margin,
    yPosition
  );
  yPosition += lineHeight * 2;

  // Participant Information
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Participant Information:", margin, yPosition);
  yPosition += lineHeight;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${data.name}`, margin, yPosition);
  yPosition += lineHeight;
  doc.text(`Email: ${data.email}`, margin, yPosition);
  yPosition += lineHeight;
  doc.text(`Phone: ${data.phone || "Not provided"}`, margin, yPosition);
  yPosition += lineHeight * 2;

  // Waiver Content
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("LIABILITY WAIVER AND RELEASE", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += lineHeight * 2;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const waiverText = `RELEASE OF LIABILITY AND ASSUMPTION OF RISK

I, ${data.name}, acknowledge that physical training involves strenuous physical activity and that such activity carries inherent risks including, but not limited to, physical injury and cardiac events. I understand that I am voluntarily participating in these activities with knowledge of the dangers involved.

TERMS AND CONDITIONS:

1. ASSUMPTION OF RISK: I understand that physical training involves strenuous physical activity and that such activity carries inherent risks including, but not limited to, physical injury and cardiac events. I voluntarily participate in these activities with knowledge of the dangers involved.

2. MEDICAL CLEARANCE: I represent that I am in good physical condition and have no medical conditions that would prevent my participation in physical training activities. I have consulted with a physician if I have any concerns about my ability to safely participate.

3. RELEASE OF LIABILITY: I, for myself and on behalf of my heirs, assigns, personal representatives, and next of kin, hereby release and hold harmless FL Best Trainer, its officers, officials, agents, employees, other participants, and sponsoring agencies from and against any and all claims for injury, disability, death, or damage.

4. INDEMNIFICATION: I agree to indemnify and hold harmless FL Best Trainer from any loss, liability, damage, or cost they may incur due to my participation in physical training activities.

5. MEDIA RELEASE: I hereby grant FL Best Trainer permission to use my likeness in photographs, videos, or other digital media in any of its publications, including web-based publications, without payment or other consideration.

6. SEVERABILITY: If any provision of this waiver is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.

7. GOVERNING LAW: This waiver shall be governed by the laws of the State of Florida, and any disputes shall be resolved in the courts of Florida.

ACKNOWLEDGMENT: By signing below, I acknowledge that I have read this waiver, understand its contents, and voluntarily agree to be bound by its terms. I understand that this is a legal and binding agreement and that I am giving up certain legal rights, including the right to sue for negligence.`;

  const splitText = doc.splitTextToSize(waiverText, pageWidth - 2 * margin);
  splitText.forEach((line: string) => {
    if (yPosition > doc.internal.pageSize.height - margin) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text(line, margin, yPosition);
    yPosition += lineHeight;
  });

  // Signature section
  yPosition += lineHeight;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("SIGNATURE:", margin, yPosition);
  yPosition += lineHeight;

  doc.setFont("helvetica", "normal");
  doc.text(
    `Signature Type: ${data.signatureType === "draw" ? "Hand-drawn" : "Typed"}`,
    margin,
    yPosition
  );
  yPosition += lineHeight;

  if (data.signatureType === "draw") {
    // For drawn signatures, we would add the image here
    doc.text(
      "Electronic Signature: [Signature image attached]",
      margin,
      yPosition
    );
    yPosition += lineHeight;
    doc.text(`Signed by: ${data.name}`, margin, yPosition);
  } else {
    doc.setFont("helvetica", "italic");
    doc.text(`Electronic Signature: ${data.signature}`, margin, yPosition);
    yPosition += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.text(
      "(Typed signature constitutes legal electronic signature)",
      margin,
      yPosition
    );
  }

  yPosition += lineHeight * 2;
  doc.text(
    `Date Signed: ${new Date(data.date).toLocaleDateString()} at ${new Date(
      data.date
    ).toLocaleTimeString()}`,
    margin,
    yPosition
  );
  yPosition += lineHeight;
  doc.text(
    `IP Address: ${
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      "Unknown"
    }`,
    margin,
    yPosition
  );
  yPosition += lineHeight;
  doc.text(`Document ID: WAIVER-${Date.now()}`, margin, yPosition);

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
  if (!name || !email || !signature) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Generate PDF
    const pdfBuffer = await generateWaiverPDF(req.body, req);
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

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
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Signature Type:</strong> ${
          signatureType === "draw" ? "Hand-drawn" : "Typed"
        }</p>
        <p><strong>Date Signed:</strong> ${new Date(date).toLocaleString()}</p>
        <p><strong>IP Address:</strong> ${
          req.headers["x-forwarded-for"] ||
          req.connection.remoteAddress ||
          "Unknown"
        }</p>
        
        <p>The complete signed waiver is attached as a PDF.</p>
        
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
        <p>This email confirms that you have successfully signed the liability waiver for FL Best Trainer.</p>
        
        <p><strong>Details:</strong></p>
        <ul>
          <li>Name: ${name}</li>
          <li>Email: ${email}</li>
          <li>Phone: ${phone || "Not provided"}</li>
          <li>Date Signed: ${new Date(date).toLocaleString()}</li>
        </ul>
        
        <p>A copy of your signed waiver is attached to this email for your records.</p>
        
        <p>We look forward to working with you!</p>
        
        <p>Best regards,<br>
        FL Best Trainer Team</p>
        
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
          name: fileName,
          parents: [process.env.GDRIVE_FOLDER_ID],
        },
        media: {
          mimeType: "application/pdf",
          body: Buffer.from(pdfBuffer),
        },
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Waiver submitted successfully" });
  } catch (err) {
    console.error("Error processing waiver:", err);
    return res.status(500).json({ error: "Failed to submit waiver" });
  }
}
