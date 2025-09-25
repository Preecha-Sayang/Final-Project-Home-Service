import logo_img from "../../../public/images/logo.png";
import Image from "next/image";
import DropdownUser from "../dropdown/DropdownUser";
import bell from "../../../public/images/icon_bell.svg";
import user_default from "../../../public/images/user_default.png";
import Link from "next/link";

type NavbarProps = {
  token?: string;
  fullname?: string;
  imageURL?: string;
};

export default function Navbar({ token, fullname, imageURL }: NavbarProps) {
  const getImageURL = imageURL === undefined ? user_default : imageURL;

  return (
    <div className="bg-[var(--white)]; shadow-md px-4 py-3 flex items-center justify-between relative">
      {/* โลโก้ และ เมนู */}
      <div className="flex items-center gap-6 ml-30">
        <Link href="/home_pages" className="cursor-pointer">
          <Image src={logo_img} alt="HomeServices" className="" />
        </Link>
        <Link href="/services" className="cursor-pointer">
          <p className="text-[var(--gray-900)] font-semibold">
            บริการของเรา
          </p>
        </Link>
      </div>
      
      {!token ? (
        <div className="mr-30">
          <a href="/login/login" className="px-2 py-2 border border-[var(--blue-600)] text-[var(--blue-600)] rounded-lg cursor-pointer">
            เข้าสู่ระบบ
          </a>
        </div>
      ) : (
        <div className="flex items-center gap-4 mr-30">
          <div className="text-gray-800 font-medium">{fullname}</div>
          <DropdownUser imageURL={getImageURL} fullname={fullname} />
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
  );
}


