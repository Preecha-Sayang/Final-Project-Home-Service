import { Pool } from "pg";

declare global {
  var pgPool: Pool | undefined;
}

// ถ้ามี pool อยู่แล้ว ใช้ตัวเดิม, ถ้าไม่สร้างใหม่
const pool = global.pgPool || new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

if (process.env.NODE_ENV !== "production") global.pgPool = pool;

export const query = (text: string, params?: unknown[]) => pool.query(text, params);

export default pool;