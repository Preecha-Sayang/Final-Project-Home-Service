import jwt, { JwtPayload } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

//สิทธิ์ของผู้ดูแล/ช่างในระบบ
export type Role = "superadmin" | "manager" | "admin" | "technician";

//โครงสร้าง payload ที่ฝังใน JWT
export interface AdminJwt extends JwtPayload {
  //อ้างอิง admin_id (หรือ technician admin user) ใน DB
  adminId: number;
  //บทบาทผู้ใช้
  role: Role;
  //อีเมล (ถ้ามี)
  email?: string;
  //JWT ID
  jti?: string;
}

const SECRET = process.env.JWT_SECRET!;
const ISSUER = process.env.JWT_ISSUER || "homeservice-app";
const AUDIENCE = process.env.JWT_AUD || "homeservice-admins";

type Blocked = "iat" | "exp" | "jti" | "iss" | "aud";
type Signable<T> = Omit<Partial<T>, Blocked>;

///สร้าง Access Token สำหรับฝั่ง admin/technician

///ระบุ issuer / audience ชัดเจน
export function signAdminAccess(payload: Signable<AdminJwt>) {
  const jti = uuidv4();
  const token = jwt.sign({ ...payload, jti }, SECRET, {
    expiresIn: "7d",
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithm: "HS256",
  });
  return { token, jti };
}

///ตรวจสอบและถอดรหัส JWT > AdminJwt
export function verifyAdminToken<T extends AdminJwt>(token: string): T {
  return jwt.verify(token, SECRET, {
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithms: ["HS256"],
  }) as T;
}

///ดึงค่า Bearer token จาก header Authorization
///ถ้าไม่มี/รูปแบบผิด จะ throw Error("Unauthorized")
export function getBearerToken(header?: string | null) {
  if (!header?.startsWith("Bearer ")) throw new Error("Unauthorized");
  return header.split(" ")[1]!;
}
