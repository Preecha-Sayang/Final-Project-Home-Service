import { useRouter } from "next/navigation";
import { useState } from "react";
import { User, List, Clock, LogOut } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import { useAuth } from "@/context/AuthContext"; // ✅ import context

type DropdownUserProps = {
  imageURL?: string | StaticImageData;
  fullname?: string;
};

export default function DropdownUser({ imageURL, fullname }: DropdownUserProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const { isLoggedIn, accessToken, refreshToken, login, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
    router.refresh();
  };

  const menuItems = [
    { label: "ข้อมูลผู้ใช้งาน", icon: <User size={18} />, href: "#" },
    { label: "รายการคำสั่งซ่อม", icon: <List size={18} />, href: "#" },
    { label: "ประวัติการซ่อม", icon: <Clock size={18} />, href: "#" },
  ];

  return (
    <div className="relative inline-block">
      {/* User Image Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-none"
      >
        <Image
          src={imageURL || "/images/user_default.png"}
          alt="user"
          width={40}
          height={40}
          className="h-10 w-10 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-200"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-md border p-2 z-50">
          {menuItems.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
              onClick={()=>setIsOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
          <a
            href="#"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
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

