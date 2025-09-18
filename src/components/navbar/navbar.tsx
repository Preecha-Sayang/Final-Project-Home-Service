import logo_img from "../../../public/images/logo.png";
import Image from "next/image";

export const Navbar = () => {
  return (
    <div className="bg-white shadow-md px-4 py-3 flex items-center justify-between relative">
      <div className="items-center">
        <Image src={logo_img} alt="" />
      </div>

      <div className="hidden md:flex items-center space-x-6">
        <a className="text-gray-700 hover:text-blue-600">บริการของเรา</a>
      </div>

      <div>
        <a
          href="#"
          className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
        >
          เข้าสู่ระบบ
        </a>
      </div>
    </div>
  );
};