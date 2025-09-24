import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { query } from "../../../../lib/db";

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
    return res.status(201).json({ user });
  } catch (err: any) {
    // Postgres error code 23505 = unique violation
    if (err.code === "23505") {
      // ตรวจสอบ constraint ที่ผิดพลาด
      if (err.constraint === "users_email_key") {
        return res.status(400).json({ error: "invalid email" });
      }
      if (err.constraint === "users_phone_number_key") {
        return res.status(400).json({ error: "invalid phonenumber" });
      }
      
    }
    return res.status(500).json({ error: err });
  }
}