import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "กรุณากรอกอีเมล" });

  try {
    const userResult = await sql`SELECT * FROM users WHERE email = ${email}`;
    const user = userResult[0];
    if (!user) return res.status(404).json({ error: "ไม่พบผู้ใช้นี้" });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 นาที

    await sql`
      UPDATE users
      SET reset_token = ${token}, reset_token_expires = ${expires}
      WHERE user_id = ${user.user_id}
    `;

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: "HomeService <no-reply@resend.dev>",
      to: email,
      subject: "รีเซ็ตรหัสผ่านของคุณ",
      html: `<p>สวัสดี ${user.fullname || ""},</p>
             <p>กดลิงก์ด้านล่างเพื่อรีเซ็ตรหัสผ่านของคุณ:</p>
             <a href="${resetLink}" target="_blank">${resetLink}</a>
             <p>ลิงก์นี้จะหมดอายุใน 15 นาที</p>`,
    });

    res.status(200).json({ message: "ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในระบบ" });
  }
}
