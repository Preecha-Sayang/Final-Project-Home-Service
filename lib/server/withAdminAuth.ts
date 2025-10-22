import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import jwt from "jsonwebtoken";

export type Role = "superadmin" | "manager" | "admin" | "technician";

// payload ของแอดมิน/ช่าง
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

/** ดึง token จาก Authorization หรือคุกกี้ชื่อ admin_jwt */
function extractToken(req: NextApiRequest): string | null {
    // 1) Authorization: Bearer <token>
    const auth = req.headers.authorization || "";
    if (auth.startsWith("Bearer ")) return auth.slice(7).trim();

    // 2) สำรองเฮดเดอร์ custom
    const xtoken = (req.headers["x-admin-token"] as string | undefined)?.trim();
    if (xtoken) return xtoken;

    // 3) คุกกี้หลายชื่อที่ระบบอาจใช้
    const c = req.cookies || {};
    const candidates = ["admin_jwt", "accessToken", "admin_token", "token"];
    for (const name of candidates) {
        const v = (c[name] || "").trim();
        if (v) return v;
    }
    return null;
}

export function withAdminAuth<TReq extends NextApiRequest = NextApiRequest>(
    handler: (req: TReq, res: NextApiResponse) => unknown | Promise<unknown>,
    roles: Role[] = []
): NextApiHandler {
    return async (req, res) => {
        try {
            const token = extractToken(req);
            if (!token) return res.status(401).json({ message: "missing token" });

            const decoded = jwt.verify(token, JWT_SECRET) as AdminJwt;
            if (!decoded?.adminId || !decoded?.role) {
                return res.status(401).json({ message: "invalid token" });
            }

            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ message: "forbidden" });
            }

            (req as unknown as AdminRequest).admin = decoded;
            return await handler(req as unknown as TReq, res);
        } catch {
            return res.status(401).json({ message: "unauthorized" });
        }
    };
}
