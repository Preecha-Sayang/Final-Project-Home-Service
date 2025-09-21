// lib/auth.ts
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export interface AuthenticatedNextApiRequest extends NextApiRequest {
  user?: { userId: number; email: string };
}

export function withAuth(handler: (req: AuthenticatedNextApiRequest, res: NextApiResponse) => void) {
  return async (req: AuthenticatedNextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      req.user = decoded as any;
      return handler(req, res);
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}