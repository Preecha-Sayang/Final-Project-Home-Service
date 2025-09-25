import logo_img from "../../../public/images/logo.png";
import Image from "next/image";
import DropdownUser from "../dropdown/DropdownUser";
import bell from "../../../public/images/icon_bell.svg";
import user_default from "../../../public/images/user_default.png";
import Link from "next/link";
import {useEffect, useState} from "react";

type NavbarProps = {
  imageURL?: string;
};

export default function Navbar({ imageURL }: NavbarProps) {
  const getImageURL = imageURL === undefined ? user_default : imageURL;

  const [token, setToken] = useState<string | null>(null);
  const [fullname, setFullname] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token'));
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch("/api/protected/protectapi", {
      headers: { Authorization: `Bearer ${token}` },
    })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => setFullname(data?.fullname))
        .catch(() => {});
  }, [token]);



  return (
    <header className="sticky top-0 z-40 bg-[var(--white)] shadow-md">
     <div className="mx-auto max-w-[1440px] h-[80px] bg-[var(--white)] flex items-center justify-between relative"> 
      {/* โลโก้ และ เมนู */}
      <div className="flex items-center gap-20 ml-15">
        <Link href="/" className="cursor-pointer">
          <Image 
          src={logo_img} 
          alt="HomeServices" 
          className="" />
          priority
          width={207}
          height={36}
        </Link>
        <Link href="/services" className="cursor-pointer">
          <p className="flex items-center text-[var(--gray-900)] font-semibold mt-1.5">
            บริการของเรา
          </p>
        </Link>
        </div>
      
      
      {!token ? (
        <div className="mr-30">
          <Link href="/login/login" className="px-2 py-2 border border-[var(--blue-600)] text-[var(--blue-600)] rounded-lg cursor-pointer">
            เข้าสู่ระบบ
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-4 mr-30">
          <div className="text-gray-800 font-medium">{fullname}</div>
          <DropdownUser  imageURL={getImageURL} fullname={fullname} />
          <div className="rounded-full bg-[var(--gray-100)] px-2 py-2 ">
            <Image
              src={bell}
              alt="bell"
              className="h-6 w-6  rounded-full  cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
    </header>
  );
}


