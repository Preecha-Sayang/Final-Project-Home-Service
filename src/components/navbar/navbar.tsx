import logo_img from "../../../public/images/logo.png";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {



  return (
    <div className="bg-white shadow-md px-4 py-3 flex items-center justify-between relative">
      {/* โลโก้ */}
      <div className="flex items-center gap-4 ml-5">
        <Image src={logo_img} alt="HomeServices" className="" />
        <a className="text-gray-900 font-semibold hover:text-blue-600 mt-5">
          บริการของเรา
        </a>
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