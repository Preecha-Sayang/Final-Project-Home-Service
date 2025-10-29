
import type { NextApiRequest, NextApiResponse } from "next";
import pool from "../../../lib/db";

type Data =
  | { time: string }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const result = await pool.query("SELECT NOW()");
    res.status(200).json({ time: result.rows[0].now }); // .now เป็น field ของ Postgres
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
}