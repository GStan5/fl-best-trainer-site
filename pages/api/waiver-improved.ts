import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import jsPDF from "jspdf";
import { Readable } from "stream";

interface WaiverBody {
  name: string;
  email: string;
  phone?: string;
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
  yPosition += lineHeight;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Personal Training Services by Gavin R. Stanifer",
    pageWidth / 2,
    yPosition,
    {
      align: "center",
    }
  );
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
  yPosition += lineHeight;
  doc.text(`IP Address: ${getClientIP(req)}`, margin, yPosition);
  yPosition += lineHeight * 2;

  // Waiver Content
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(
    "LIABILITY WAIVER, RELEASE, AND INDEMNIFICATION AGREEMENT",
    pageWidth / 2,
    yPosition,
    {
      align: "center",
    }
  );
  yPosition += lineHeight * 2;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const waiverText = `ASSUMPTION OF RISK, WAIVER OF CLAIMS, RELEASE OF LIABILITY, AND INDEMNITY AGREEMENT

READ CAREFULLY - THIS IS A LEGAL DOCUMENT THAT AFFECTS YOUR LEGAL RIGHTS

I, ${data.name}, in consideration for being permitted to participate in personal training services, fitness instruction, and related activities provided by Gavin R. Stanifer, doing business as "FL Best Trainer" (collectively referred to as "Provider"), acknowledge, understand, and agree to the following:

1. ASSUMPTION OF RISK: I understand and acknowledge that physical exercise, fitness training, and related activities involve inherent risks of physical injury, including but not limited to: muscle strains, sprains, tears, broken bones, heart attack, stroke, heat exhaustion, dehydration, and in extreme cases, permanent disability or death. I voluntarily assume all such risks and hazards incidental to such participation for myself and (if applicable) my minor child.

2. PHYSICAL CONDITION: I represent and warrant that I am in good physical condition and have no medical condition, impairment, disease, infirmity, or other illness that would prevent my participation or use of equipment or that would increase my risk of injury or adverse health consequences. I acknowledge that Provider has recommended that I consult with a physician before beginning any exercise program.

3. RELEASE AND WAIVER: I, for myself and my heirs, assigns, personal representatives, and next of kin, HEREBY RELEASE, WAIVE, DISCHARGE, AND COVENANT NOT TO SUE Gavin R. Stanifer, FL Best Trainer, and their respective officers, directors, employees, agents, contractors, and representatives (collectively "Released Parties") from any and all liability, claims, demands, losses, or damages on my account caused or alleged to be caused in whole or in part by the negligence of the Released Parties or otherwise, including negligent rescue operations, and I further agree that if, despite this release and waiver of liability, assumption of risk, and indemnity agreement, I, or anyone on my behalf, makes a claim against any of the Released Parties, I will indemnify, save, and hold harmless each of the Released Parties from any litigation expenses, attorney fees, loss, liability, damage, or cost which any may incur as the result of such claim.

4. INDEMNIFICATION: I agree to indemnify and hold harmless the Released Parties from any loss, liability, damage, or cost they may incur arising out of or related to my participation in activities, whether caused by my own actions or inactions, those of others participating in the activity, the conditions in which the activities take place, or the negligence of the Released Parties.

5. MEDICAL TREATMENT: I consent to receive medical treatment that may be deemed advisable in the event of injury, accident, and/or illness during participation. I understand and agree that I am solely responsible for all costs related to medical treatment and transportation.

6. MEDIA RELEASE: I grant to the Released Parties the irrevocable right and permission to photograph, videotape, or otherwise record my participation and to use such recordings for promotional, educational, or commercial purposes without compensation to me.

7. EQUIPMENT USE: I acknowledge that I am responsible for inspecting any equipment before use and will immediately report any unsafe conditions. I will use equipment only as instructed and within my capabilities.

8. SEVERABILITY: If any provision of this agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.

9. GOVERNING LAW: This agreement shall be governed by the laws of the State of Florida. Any disputes arising under this agreement shall be resolved exclusively in the courts of Florida, and I consent to the jurisdiction of such courts.

10. ENTIRE AGREEMENT: This document constitutes the entire agreement between the parties and supersedes any prior understandings or agreements.

I HAVE READ THIS AGREEMENT, FULLY UNDERSTAND ITS TERMS, UNDERSTAND THAT I AM GIVING UP SUBSTANTIAL RIGHTS INCLUDING MY RIGHT TO SUE, AND HAVE SIGNED IT FREELY AND WITHOUT ANY INDUCEMENT OR ASSURANCE OF ANY NATURE.`;

  const splitText = doc.splitTextToSize(waiverText, pageWidth - 2 * margin);
  splitText.forEach((line: string) => {
    if (yPosition > doc.internal.pageSize.height - margin - 40) {
      // Leave space for signature
      doc.addPage();
      yPosition = margin;
    }
    doc.text(line, margin, yPosition);
    yPosition += lineHeight;
  });

  // Add some space before signature section
  yPosition += lineHeight;

  // Signature section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("ELECTRONIC SIGNATURE AND ACKNOWLEDGMENT:", margin, yPosition);
  yPosition += lineHeight * 1.5;

  doc.setFont("helvetica", "normal");
  doc.text(
    `Signature Method: ${
      data.signatureType === "draw"
        ? "Hand-drawn electronic signature"
        : "Typed electronic signature"
    }`,
    margin,
    yPosition
  );
  yPosition += lineHeight;

  if (
    data.signatureType === "draw" &&
    data.signature.startsWith("data:image/")
  ) {
    // Add the actual signature image to the PDF
    try {
      doc.text("Electronic Signature:", margin, yPosition);
      yPosition += lineHeight;

      // Add signature image
      const imgWidth = 100;
      const imgHeight = 30;
      doc.addImage(
        data.signature,
        "PNG",
        margin,
        yPosition,
        imgWidth,
        imgHeight
      );
      yPosition += imgHeight + lineHeight;

      doc.text(`Digitally signed by: ${data.name}`, margin, yPosition);
    } catch (error) {
      // Fallback if image can't be added
      doc.text(
        "Electronic Signature: [Hand-drawn signature captured]",
        margin,
        yPosition
      );
      yPosition += lineHeight;
      doc.text(`Signed by: ${data.name}`, margin, yPosition);
    }
  } else {
    doc.setFont("helvetica", "italic");
    doc.text(`Electronic Signature: ${data.signature}`, margin, yPosition);
    yPosition += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.text(
      "(Typed name constitutes legal electronic signature under ESIGN Act)",
      margin,
      yPosition
    );
  }

  yPosition += lineHeight * 1.5;
  doc.text(
    `Date & Time Signed: ${new Date(
      data.date
    ).toLocaleDateString()} at ${new Date(data.date).toLocaleTimeString()}`,
    margin,
    yPosition
  );
  yPosition += lineHeight;
  doc.text(`Client IP Address: ${getClientIP(req)}`, margin, yPosition);
  yPosition += lineHeight;
  doc.text(`Document ID: WAIVER-${Date.now()}`, margin, yPosition);
  yPosition += lineHeight;
  doc.text(
    `Electronic Record: This document was electronically signed and is legally binding`,
    margin,
    yPosition
  );

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
          <li>Phone: ${phone || "Not provided"}</li>
          <li>Date Signed: ${new Date(date).toLocaleString()}</li>
          <li>Signature Type: ${
            signatureType === "draw" ? "Hand-drawn" : "Typed"
          }</li>
        </ul>
        
        <p>A copy of your complete signed waiver is attached to this email for your records. This is a legally binding document.</p>
        
        <p>We look forward to working with you!</p>
        
        <p>Best regards,<br>
        Gavin R. Stanifer<br>
        FL Best Trainer</p>
        
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

      // Create a readable stream from the PDF buffer
      const pdfStream = new Readable({
        read() {
          this.push(Buffer.from(pdfBuffer));
          this.push(null);
        },
      });

      await drive.files.create({
        requestBody: {
          name: fileName,
          parents: [process.env.GDRIVE_FOLDER_ID],
        },
        media: {
          mimeType: "application/pdf",
          body: pdfStream,
        },
      });
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

    return res
      .status(200)
      .json({ success: true, message: "Waiver submitted successfully" });
  } catch (err) {
    console.error("Error processing waiver:", err);
    return res.status(500).json({ error: "Failed to submit waiver" });
  }
}
