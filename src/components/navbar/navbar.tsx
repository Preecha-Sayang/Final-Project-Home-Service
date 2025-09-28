import logo_img from "../../../public/images/logo.png";
import Image from "next/image";
import DropdownUser from "../dropdown/DropdownUser";
import user_default from "../../../public/images/user_default.png";
import Link from "next/link";
import {useEffect, useState} from "react";
import IconBell from "../button/iconbell";
import { useAuth } from "@/context/AuthContext";

type NavbarProps = {
  imageURL?: string;
};

export default function Navbar({ imageURL }: NavbarProps) {
  const getImageURL = imageURL === undefined ? user_default : imageURL;

  const [fullname, setFullname] = useState<string | undefined>(undefined);
  const { isLoggedIn, accessToken, refreshToken, login, logout } = useAuth();
  


  useEffect(() => {
    if (!accessToken) return;
    fetch("/api/protected/protectapi", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => setFullname(data?.fullname))
        .catch(() => {});
  }, [accessToken]);



  return (
    <div className="sticky top-0 z-40 bg-[var(--white)] shadow-md">
    <div className="mx-auto max-w-[1440px] h-[80px] bg-[var(--white)] flex items-center justify-between relative">
      {/* โลโก้ และ เมนู */}
      <div className="flex items-center gap-20 ml-15">
        <Link href="/" className="cursor-pointer">
          <Image 
          src={logo_img} 
          alt="HomeServices" 
          className="" 
          priority
          width={207}
          height={36}
        />
    
        </Link>
        <Link href="/services" className="cursor-pointer">
        <p className="flex items-center text-[var(--gray-900)] font-semibold mt-1.5">
            บริการของเรา
          </p>
        </Link>
      </div>
      
      {!isLoggedIn ? (
        <div className="mr-15">
          <Link href="/loginuser/login" className="px-2 py-2 border border-[var(--blue-600)] text-[var(--blue-600)] rounded-lg cursor-pointer">
            เข้าสู่ระบบ
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-4 mr-30">
          <div className="text-gray-800 font-medium">{fullname}</div>
          <DropdownUser  imageURL={getImageURL} fullname={fullname} />
          <IconBell />
        </div>
      )}
    </div>
    </div>
  );
}


