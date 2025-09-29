import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import jwt from "jsonwebtoken";

export type Role = "superadmin" | "manager" | "staff";

// ปรับ field ให้ตรงกับ payload จริงของโปรเจกต์
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

/**
 * withAdminAuth:
 * - ตรวจ token
 * - ใส่ req.admin
 * - ตรวจ role (ถ้ากำหนด)
 * - รองรับ generic TReq ที่สืบทอดจาก NextApiRequest
 */
export function withAdminAuth<TReq extends NextApiRequest = NextApiRequest>(
    handler: (req: TReq, res: NextApiResponse) => unknown | Promise<unknown>,
    roles: Role[] = []
): NextApiHandler {
    return async (req, res) => {
        try {
            const auth = req.headers.authorization || "";
            const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
            if (!token) return res.status(401).json({ message: "missing token" });

            const decoded = jwt.verify(token, JWT_SECRET) as AdminJwt;
            if (!decoded?.adminId || !decoded?.role)
                return res.status(401).json({ message: "invalid token" });

            if (roles.length && !roles.includes(decoded.role))
                return res.status(403).json({ message: "forbidden" });

            // inject admin ลง req
            (req as unknown as AdminRequest).admin = decoded;

            // เรียก handler ด้วยชนิดที่ผู้ใช้ระบุ
            return await handler(req as unknown as TReq, res);
        } catch {
            return res.status(401).json({ message: "unauthorized" });
        }
    };
}
