import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import jwt from "jsonwebtoken";

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

function pickCookie(
    bag: Record<string, string | undefined> | undefined
): string | null {
    if (!bag) return null;
    const keys = ["admin_jwt", "accessToken", "admin_token", "token"];
    for (const k of keys) {
        const v = bag[k];
        if (v && v.trim()) return v.trim();
    }
    return null;
}

/** ดึง token จาก header/cookie หลาย ๆ ทาง */
function extractToken(req: NextApiRequest): string | null {
    // 1) Authorization
    const auth = req.headers.authorization || "";
    if (auth.startsWith("Bearer ")) return auth.slice(7).trim();

    // 2) X-Admin-Token
    const xtoken = (req.headers["x-admin-token"] as string | undefined)?.trim();
    if (xtoken) return xtoken;

    // 3) next cookies object
    const fromObj = pickCookie(req.cookies);
    if (fromObj) return fromObj;

    // 4) raw Cookie header
    const raw = req.headers.cookie;
    if (raw) {
        const bag: Record<string, string> = {};
        for (const part of raw.split(";")) {
            const i = part.indexOf("=");
            if (i > -1) {
                const k = part.slice(0, i).trim();
                const v = part.slice(i + 1).trim();
                bag[k] = decodeURIComponent(v);
            }
        }
        const fromRaw = pickCookie(bag);
        if (fromRaw) return fromRaw;
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
            if (!token) {
                if (process.env.NODE_ENV !== "production") {
                    return res.status(401).json({ ok: false, message: "missing token" });
                }
                return res.status(401).end();
            }

            const decoded = jwt.verify(token, JWT_SECRET) as AdminJwt;
            if (!decoded?.adminId || !decoded?.role) {
                return res.status(401).json({ ok: false, message: "invalid token" });
            }

            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ ok: false, message: "forbidden" });
            }

            (req as unknown as AdminRequest).admin = decoded;
            return await handler(req as unknown as TReq, res);
        } catch (err) {
            if (process.env.NODE_ENV !== "production") {
                return res
                    .status(401)
                    .json({ ok: false, message: "unauthorized", error: String(err) });
            }
            return res.status(401).end();
        }
    };
}
