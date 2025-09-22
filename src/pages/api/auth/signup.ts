import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { query } from "../../../../lib/db";
import { signAccessToken } from "../../../../lib/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { fullname, email, phone_number, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  try {
    const result = await query(
      `INSERT INTO users(fullname, email, phone_number, password)
       VALUES($1, $2, $3, $4)
       RETURNING user_id, fullname, email`,
      [fullname, email, phone_number, hashed]
    );

    const user = result.rows[0];

    // ✅ Sign JWT หลังสมัคร
    const { token } = signAccessToken({
      userId: String(user.user_id),
      email: user.email,
      fullname: user.fullname
    });
    return res.status(201).json({ user, token });
  } catch (err: unknown) {
    return res.status(400).json({ error: (err as Error).message });
  }
}