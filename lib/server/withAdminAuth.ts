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
    try {
      // อ่าน token จาก cookie เท่านั้น
      const cookies = cookie.parse(req.headers.cookie || "");
      const token = cookies.accesstoken || cookies.accessToken; // รองรับสองชื่อ

      if (!token) {
        return res.status(401).json({ ok: false, message: "missing token" });
      }

      // ตรวจสอบ token
      const decoded = jwt.verify(token, JWT_SECRET) as AdminJwt;

      if (!decoded?.adminId || !decoded?.role) {
        return res.status(401).json({ ok: false, message: "invalid token" });
      }

      // ตรวจ role ถ้ามีระบุ
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ ok: false, message: "forbidden" });
      }

      (req as unknown as AdminRequest).admin = decoded;

      // เรียก handler ต่อ
      return await handler(req as unknown as TReq, res);
    } catch (err) {
      console.error("Auth error:", err);
      return res
        .status(401)
        .json({ ok: false, message: "unauthorized", error: String(err) });
    }
  };
}