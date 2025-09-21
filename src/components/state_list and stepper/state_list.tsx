import React from "react";
const { useState } = React;
import Image from "next/image";

interface StateItem {
  id: number;
  title: string;
  status: "inactive" | "pending" | "active";
}

export default function StateList() {
  const [hoveredItem, setHoveredItem] = useState(false);
  const [status, setStatus] = useState<"inactive" | "pending" | "active">("inactive");

  const handleClick = () => {
    setStatus((prev) => {
      if (prev === "inactive") return "pending";
      if (prev === "pending") return "active";
      return "inactive";
    });
  };

  const handleMouseEnter = () => {
    setHoveredItem(true);
  };

  const handleMouseLeave = () => {
    setHoveredItem(false);
  };

  const getStatusStyles = (status: "inactive" | "pending" | "active", isHovered: boolean) => {
    if (status === "active") {
      return {
        iconBg: "bg-blue-500",
        textColor: "text-blue-600",
        iconFilter: "brightness-0 invert", // สีขาว
      };
    }

    if (status === "pending") {
      if (isHovered) {
        return {
          iconBg: "bg-blue-500",
          textColor: "text-blue-500",
          iconFilter: "brightness-0 invert", // สีขาว
        };
      }
      return {
        iconBg: "bg-white border-2 border-blue-500",
        textColor: "text-blue-500",
        iconFilter: "hue-rotate(210deg) saturate(2)", // สีน้ำเงิน
      };
    }

    // inactive state
    if (isHovered) {
      return {
        iconBg: "bg-white border-2 border-blue-500",
        textColor: "text-blue-500",
        iconFilter: "brightness-0 invert", // สีขาว
      };
    }

    return {
      iconBg: "bg-white border-2 border-gray-300",
      textColor: "text-gray-700",
      iconFilter: "brightness-0 invert", // สีขาว
    };
  };

  return (
    <div className="flex justify-center mt-8">
      <button
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex flex-col items-center cursor-pointer transition-all focus:outline-none"
        disabled={false}
      >
        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all ${getStatusStyles(status, hoveredItem).iconBg}`}
        >
          <Image
            src="/images/icon_document.svg"
            alt="Icon document"
            width={32}
            height={32}
            className="w-8 h-8 transition-all"
            style={{ filter: getStatusStyles(status, hoveredItem).iconFilter }}
          />
        </div>

        {/* Text */}
        <span
          className={`text-lg font-medium transition-all ${getStatusStyles(status, hoveredItem).textColor}`}
        >
          รายการ
        </span>
      </button>
    </div>
  );
}