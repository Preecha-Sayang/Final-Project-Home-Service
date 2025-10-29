import { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // ลบ cookie
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0), // หมดอายุ = ลบ
    })
  );

  res.status(200).json({ message: "Logout success" });
}
