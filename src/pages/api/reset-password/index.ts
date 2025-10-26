import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { sql } from "lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: "ข้อมูลไม่ครบ" });

  try {
    const result = await sql`
      SELECT * FROM users
      WHERE reset_token = ${token}
      AND reset_token_expires > NOW()
    `;
    const user = result[0];
    if (!user) return res.status(400).json({ error: "Token ไม่ถูกต้องหรือหมดอายุ" });

    const hashed = await bcrypt.hash(password, 10);

    await sql`
      UPDATE users
      SET password = ${hashed},
          reset_token = NULL,
          reset_token_expires = NULL
      WHERE user_id = ${user.user_id}
    `;

    res.status(200).json({ message: "รีเซ็ตรหัสผ่านสำเร็จ" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในระบบ" });
  }
}
