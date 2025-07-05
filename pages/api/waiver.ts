import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

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
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { name, email, phone, signature } = req.body as WaiverBody;
  if (!name || !email || !signature) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const waiverText = `FL Best Trainer Liability Waiver\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || ''}\nSignature: ${signature}\nDate: ${new Date().toLocaleDateString()}`;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `New Waiver from ${name}`,
      text: waiverText,
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Copy of your FL Best Trainer waiver',
      text: waiverText,
    });

    if (
      process.env.GDRIVE_CLIENT_EMAIL &&
      process.env.GDRIVE_PRIVATE_KEY &&
      process.env.GDRIVE_FOLDER_ID
    ) {
      const auth = new google.auth.JWT(
        process.env.GDRIVE_CLIENT_EMAIL,
        undefined,
        process.env.GDRIVE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/drive.file']
      );
      const drive = google.drive({ version: 'v3', auth });
      await drive.files.create({
        requestBody: {
          name: `waiver_${Date.now()}.txt`,
          parents: [process.env.GDRIVE_FOLDER_ID],
        },
        media: {
          mimeType: 'text/plain',
          body: waiverText,
        },
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to submit waiver' });
  }
}
