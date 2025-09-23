// pages/api/profile.ts
import type { NextApiResponse } from "next";
import { query } from "../../../../lib/db";
import { withAuth, AuthenticatedNextApiRequest } from "../../../middlewere/auth";

async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  const result = await query(
    "SELECT user_id, fullname, email, phone_number, create_at FROM users WHERE user_id=$1",
    [Number(req.user!.userId)]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.status(200).json(result.rows[0]);
}

export default withAuth(handler);

