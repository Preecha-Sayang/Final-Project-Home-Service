import React, { useState } from "react";
import Image from "next/image";

type Status = "inactive" | "pending" | "active";

export default function StateList() {
  const [status, setStatus] = useState<Status>("inactive");

  const handleClick = () => {
    setStatus((prev) => {
      if (prev === "inactive") return "pending";
      if (prev === "pending") return "active";
      return "inactive";
    });
  };

  const getStatusStyles = (status: Status) => {
    if (status === "active") {
      return {
        textColor: "text-[var(--gray-700)]",
        iconSrc: "/images/icon_document_gray_1.svg", // ไอคอนสีขาว (ใส่วงกลมมาใน svg เลย)
      };
    }

    if (status === "pending") {
      return {
        textColor: "text-[var(--blue-500)]",
        iconSrc: "/images/icon_document_blue_1.svg", // ไอคอนสีน้ำเงิน (ใส่วงกลมมาใน svg เลย)
      };
    }

    // inactive
    return {
      textColor: "text-[var(--blue-500)]",
      iconSrc: "/images/icon_document_blue_2.svg", // ไอคอนสีเทา (ใส่วงกลมมาใน svg เลย)
    };
  };

  const styles = getStatusStyles(status);

  return (
    <div className="flex justify-center mt-8">
      <button
        onClick={handleClick}
        className="flex flex-col items-center cursor-pointer transition-all focus:outline-none"
      >
        {/* Icon */}
        <Image
          src={styles.iconSrc}
          alt="Icon document"
          width={64}
          height={64}
          className="transition-all"
        />

        {/* Text */}
        <span className={`mt-3 text-lg font-medium transition-all ${styles.textColor}`}>
          รายการ
        </span>
      </button>
    </div>
  );
}
