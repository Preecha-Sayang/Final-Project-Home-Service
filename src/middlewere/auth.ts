//เอาไว้ใส่ api backend ที่ต้องตรวจว่าtoken ไหมก่อนส่งไปขอข้อมูลที่ database

import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken, JwtPayloadBase } from "../../lib/jwt";

export interface AuthenticatedNextApiRequest extends NextApiRequest {
  user?: JwtPayloadBase;
}

export function withAuth(
  handler: (req: AuthenticatedNextApiRequest, res: NextApiResponse) => void | Promise<void>
) {
  return async (req: AuthenticatedNextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = verifyToken<JwtPayloadBase>(token);
      req.user = decoded;
      return handler(req, res);
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}