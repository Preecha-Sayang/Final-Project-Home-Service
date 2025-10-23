"use client";
import { ReactNode } from "react";
import NavbarTechnician, { MenuItem } from "@/components/navbartech";

interface TechnicianShellProps {
  children: ReactNode;
}

export default function TechnicianShell({ children }: TechnicianShellProps) {
  // รายการเมนู (สามารถเปลี่ยน count หรือเพิ่มได้ภายหลัง)
  const menuItems: MenuItem[] = [
    {
      label: "คำขอบริการซ่อม",
      path: "/technician",
      icon: "/images/icon_bell_off.svg",
      count: 0,
    },
    {
      label: "รายการที่รอดำเนินการ",
      path: "/technician/pending",
      icon: "/images/icon_tasklist.svg",
      count: 0,
    },
    {
      label: "ประวัติการซ่อม",
      path: "/technician/history",
      icon: "/images/icon_history.svg",
    },
    {
      label: "ตั้งค่าบัญชีผู้ใช้",
      path: "/technician/settings",
      icon: "/images/icon_user.svg",
    },
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr]">
      {/* Sidebar + Navbar responsive */}
      <NavbarTechnician menuItems={menuItems} />

      {/* Main content */}
      <main className="bg-[#f7f8fa] min-h-screen">{children}</main>
    </div>
  );
}
