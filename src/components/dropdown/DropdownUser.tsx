"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { User, List, Clock, LogOut } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import { useAuth } from "@/context/AuthContext"; // ✅ import context

type DropdownUserProps = {
  imageURL?: string | StaticImageData;
  fullname?: string;
};

export default function DropdownUser({ imageURL }: DropdownUserProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const handleGoToTaskList = (href: string) => {
  setIsOpen(false);
  router.push(href);
};
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
    router.refresh();
  };

const menuItems = [
  {
    label: "ข้อมูลผู้ใช้งาน",
    icon: <User size={18} />,
    href: "/afterservice?tab=ข้อมูลผู้ใช้งาน",
  },
  {
    label: "รายการคำสั่งซ่อม",
    icon: <List size={18} />,
    href: "/afterservice?tab=รายการคำสั่งซ่อม",
  },
  {
    label: "ประวัติการซ่อม",
    icon: <Clock size={18} />,
    href: "/afterservice?tab=ประวัติการสั่งซ่อม",
  },
];

  return (
    <div className="relative inline-block">
      {/* User Image Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-none w-[40px] h-[40px] flex justify-center items-center"
      >
        <Image
          src={imageURL || "/images/user_default.png"}
          alt="user"
          width={512}
          height={512}
          className="h-8 w-8 rounded-full cursor-pointer hover:ring-2 hover:ring-[var(--blue-200)] object-cover"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[var(--white)] rounded-xl shadow-md border border-[var(--gray-300)] p-2 z-50">
          {menuItems.map((item, idx) => (
            <a
              key={idx}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-[var(--gray-700)] hover:bg-[var(--gray-100)]"
              onClick={() => handleGoToTaskList(item.href)}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
          <a
            href="#"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-[var(--gray-700)] hover:bg-[var(--gray-100)]"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>ออกจากระบบ</span>
          </a>
        </div>
      )}
    </div>
  );
}
