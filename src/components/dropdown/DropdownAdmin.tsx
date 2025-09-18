import Image from "next/image";


import { useState } from "react";
import { User, List, Clock, LayoutDashboard, LogOut } from "lucide-react";

export default function DropdownAdmin() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "ข้อมูลผู้ใช้งาน", icon: <User size={18} />, href: "#" },
    { label: "รายการคำสั่งซ่อม", icon: <List size={18} />, href: "#" },
    { label: "ประวัติการซ่อม", icon: <Clock size={18} />, href: "#" },
    { label: "Admin Dashboard", icon: <LayoutDashboard size={18} />, href: "#" },
    { label: "ออกจากระบบ", icon: <LogOut size={18} />, href: "#" },
  ];

  return (
    <div className="relative inline-block">
      {/* ปุ่ม */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Drop Down - Admin
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute mt-2 w-64 bg-white rounded-xl shadow-md border p-2 z-50">
          {menuItems.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
