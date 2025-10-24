import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import jwt from "jsonwebtoken";
import cookie from "cookie";

export type Role = "superadmin" | "manager" | "admin" | "technician";

export type AdminJwt = {
  adminId: string;
  role: Role;
  email: string;
};

export interface AdminRequest extends NextApiRequest {
  admin: AdminJwt;
}

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

export function withAdminAuth<TReq extends NextApiRequest = NextApiRequest>(
  handler: (req: TReq, res: NextApiResponse) => unknown | Promise<unknown>,
  roles: Role[] = []
): NextApiHandler {
  return async (req, res) => {
    let decoded: AdminJwt;
    try {
      let token = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7).trim()
        : undefined;

      if (!token && req.headers.cookie) {
        const cookies = cookie.parse(req.headers.cookie);
        token = cookies.accessToken;
      }

      if (!token) {
        return res.status(401).json({ ok: false, message: "missing token" });
      }

      decoded = jwt.verify(token, JWT_SECRET) as AdminJwt;

      if (!decoded?.adminId || !decoded?.role) {
        return res.status(401).json({ ok: false, message: "invalid token" });
      }
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ ok: false, message: "forbidden" });
      }
      (req as unknown as AdminRequest).admin = decoded;
    } catch (err) {
      return res
        .status(401)
        .json({ ok: false, message: "unauthorized", error: String(err) });
    }

    try {
      return await handler(req as unknown as TReq, res);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error(err);
        return res
          .status(500)
          .json({ ok: false, message: "server error", error: String(err) });
      }
      return res.status(500).end();
    }
  };
}
