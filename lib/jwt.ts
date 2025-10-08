
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

// กำหนด type payload แบบ inline
export interface JwtPayloadBase {
  userId: string;           // userId
  email?: string;
  jti?: string;
  iat?: number;
  exp?: number;
}
if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not defined");
const JWT_SECRET = process.env.JWT_SECRET!;
const ISSUER = process.env.JWT_ISSUER || "your-app";
const AUDIENCE = process.env.JWT_AUD || "your-app-users";

export function signAccessToken(payload: Partial<JwtPayloadBase>) {
  const jti = uuidv4();
  const token = jwt.sign(
    { ...payload, jti, iss: ISSUER, aud: AUDIENCE },
    JWT_SECRET,
    { expiresIn: "1m" }
  );
  return { token, jti };
}

export function signRefreshToken(payload: Partial<JwtPayloadBase>) {
  const jti = uuidv4();
  const token = jwt.sign(
    { ...payload, jti, iss: ISSUER, aud: AUDIENCE },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
  return { token, jti };
}


export function verifyToken<T extends JwtPayloadBase>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}