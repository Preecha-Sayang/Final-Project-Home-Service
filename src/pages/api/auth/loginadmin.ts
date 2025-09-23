import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { query } from "../../../../lib/db";
import { signAccessToken } from "../../../../lib/jwt";



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
  const result = await query(`SELECT * FROM users WHERE email = $1`, [email]);
  const user = result.rows[0];

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const { token } = signAccessToken({
    userId: String(user.user_id),
    email: user.email,
    fullname: user.fullname
  });

  return res.status(200).json({ token, user: { user_id: user.user_id, fullname: user.fullname, email: user.email } });
} catch (err: unknown) {
  console.error("Login error:", err);
  return res.status(500).json({ error: "ไม่สามารถเข้าสู่ระบบได้" });
}
}