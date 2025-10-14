// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // อนุญาตหน้า login
  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("accessToken")?.value;

  // ถ้าไม่มี token ให้เด้งไปหน้า login (แนบ next ไว้กลับมาหน้าเดิมได้)
  if (!token) {
    const url = new URL("/admin/login", req.url);
    return NextResponse.redirect(url);
  }

  // มี token แล้ว ให้ผ่าน
  return NextResponse.next();
}

// ให้ middleware ทำงานเฉพาะเส้นทาง /admin/*
export const config = {
  matcher: ["/admin/:path*"],
};
