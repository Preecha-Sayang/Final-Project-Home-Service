import logo_img from "../../../public/images/logo.png";
import Image from "next/image";


import bell from "../../../public/images/icon_bell.svg";
import user_default from "../../../public/images/user_default.png";


type NavbarProps = {
  token?: string;
  fullname?: string;
  imageURL?: string;
};

export default function Navbar({ token, fullname, imageURL }: NavbarProps) {

  
  const getImageURL = imageURL === undefined ? user_default : imageURL

  return (
    <div className="bg-[var(--white)]; shadow-md px-4 py-3 flex items-center justify-between relative">
      {/* โลโก้ */}

      <div className="flex items-center gap-4 ml-30">
        <button>
          <Image src={logo_img} alt="HomeServices" className="" />
        </button>
        <p className="text-[var(--gray-900)] font-semibold mt-5">
          บริการของเรา
        </p>
      </div>

      {!token ? (
        <div className="mr-30">
          <button className="px-2 py-2 border border-[var(--blue-600)] text-[var(--blue-600)] rounded-lg cursor-pointer">
            เข้าสู่ระบบ
          </button>
        </div>
      ) : (
        <div className="flex flex-row items-center justify-center gap-4 mr-30 ">
          <p>{fullname}</p>
          <Image
            src={getImageURL}
            alt="user"
            className="h-10 w-10 rounded-full cursor-pointer"
            width={20}
            height={20}
          />
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
