import React, { useState } from "react";
import Image from "next/image";

export default function SelectBox() {
  const [selected, setSelected] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => setSelected(!selected)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        group 
        w-[227px] h-[86px] 
        flex flex-col items-center justify-center 
        rounded-[5px] border transition-all
        ${selected ? "bg-blue-50 border-blue-500" : "bg-white border-gray-300 hover:border-blue-500"}
      `}
    >
      {/* ไอคอน */}
      <Image
        src={
          selected || hovered
            ? "/images/qr_code_2_blue_24dp 1 (2).svg"
            : "/images/icon_qr.svg"
        }
        alt="QR Icon"
        width={32}
        height={32}
        className="transition-all"
      />

      {/* ข้อความ */}
      <span
        className={`mt-2 font-medium transition-all ${
          selected
            ? "text-blue-600"
            : hovered
            ? "text-blue-600"
            : "text-gray-500"
        }`}
      >
        {selected ? "Selected" : hovered ? "Hover" : "Default"}
      </span>
    </button>
  );
}
