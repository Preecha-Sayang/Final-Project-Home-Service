import type { NextApiRequest, NextApiResponse } from "next";
import {
  verifyToken,
  signAccessToken,
  signRefreshToken,
  JwtPayloadBase,
} from "../../../../lib/jwt";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: "Missing refresh token" });

    const payload: JwtPayloadBase = verifyToken(refreshToken);

    // แก้จากเดิมที่มีแค่ userId
    const newAccessToken = signAccessToken({
      userId: payload.userId,
      email: payload.email, // ✅ เพิ่ม email เข้าไป
    }).token;

    const newRefreshToken = signRefreshToken({
      userId: payload.userId,
      email: payload.email, // ✅ เพิ่ม email เข้าไปด้วย
    }).token;

    return res
      .status(200)
      .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
}
