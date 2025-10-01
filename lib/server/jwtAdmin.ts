import jwt, { JwtPayload } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export interface AdminJwt extends JwtPayload {
  adminId: string;
  role: "superadmin" | "manager";
  email?: string;
  jti?: string;
}

const SECRET = process.env.JWT_SECRET!;
const ISSUER = process.env.JWT_ISSUER || "homeservice-app";
const AUDIENCE = process.env.JWT_AUD || "homeservice-admins";

type Blocked = "iat" | "exp" | "jti" | "iss" | "aud";
type Signable<T> = Omit<Partial<T>, Blocked>;

export function signAdminAccess(payload: Signable<AdminJwt>) {
  const jti = uuidv4();
  const token = jwt.sign({ ...payload, jti }, SECRET, {
    expiresIn: "1h",
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithm: "HS256",
  });
  return { token, jti };
}

export function verifyAdminToken<T extends AdminJwt>(token: string): T {
  return jwt.verify(token, SECRET, {
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithms: ["HS256"],
  }) as T;
}

export function getBearerToken(header?: string | null) {
  if (!header?.startsWith("Bearer ")) throw new Error("Unauthorized");
  return header.split(" ")[1]!;
}
