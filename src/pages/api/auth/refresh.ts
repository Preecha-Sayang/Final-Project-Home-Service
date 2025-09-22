import type { NextApiRequest, NextApiResponse } from "next";
import { verifyToken, signAccessToken, signRefreshToken, JwtPayloadBase } from "../../../../lib/jwt";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Missing refresh token" });

    const payload: JwtPayloadBase = verifyToken(refreshToken); // verify token
    // สร้าง access token ใหม่
    const newAccessToken = signAccessToken({ userId: payload.userId }).token;

    // สามารถสร้าง refresh token ใหม่ได้ (optional)
    const newRefreshToken = signRefreshToken({ userId: payload.userId }).token;

    return res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
}