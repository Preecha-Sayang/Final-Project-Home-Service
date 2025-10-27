import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAdminToken } from "lib/server/jwtAdmin";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ admin: null });

  try {
    const admin = verifyAdminToken(token);
    res.status(200).json({ admin });
  } catch (err) {
    res.status(401).json({ admin: null });
  }
}
