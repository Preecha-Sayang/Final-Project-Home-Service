import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAdminToken } from "lib/server/jwtAdmin";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.accessToken;
  if (!token) return res.status(200).json({ admin: null });

  try {
    const admin = verifyAdminToken(token);
    res.status(200).json({ admin });
  } catch (err) {
    console.log(err)
    res.status(200).json({ admin: null });
  }
}
