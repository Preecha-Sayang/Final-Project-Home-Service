import React, { useState } from "react";
import Image from "next/image";

interface SelectBoxProps {
  id?: string;
  label?: string;
  icon?: string;
  iconHover?: string;
  selected?: boolean;
  disabled?: boolean;
  width?: string;
  height?: string;
  onClick?: (selected: boolean) => void;
  className?: string;
  defaultText?: string;
  selectedText?: string;
  hoverText?: string;
}

export default function SelectBox({
  id,
  label,
  icon = "/images/icon_qr.svg",
  iconHover = "/images/qr_code_2_blue_24dp 1 (2).svg",
  selected: controlledSelected,
  disabled = false,
  width = "w-[227px]",
  height = "h-[86px]",
  onClick,
  className = "",
  defaultText = "Default",
  selectedText = "Selected",
  hoverText = "Hover"
}: SelectBoxProps) {
  const [internalSelected, setInternalSelected] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Use controlled or uncontrolled state
  const isSelected = controlledSelected !== undefined ? controlledSelected : internalSelected;

  const handleClick = () => {
    if (disabled) return;
    
    const newSelected = !isSelected;
    
    if (controlledSelected === undefined) {
      setInternalSelected(newSelected);
    }
    
    if (onClick) {
      onClick(newSelected);
    }
  };

  const handleMouseEnter = () => {
    if (!disabled) {
      setHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const getDisplayText = () => {
    if (label) return label;
    if (isSelected) return selectedText;
    if (hovered && !disabled) return hoverText;
    return defaultText;
  };

  const getIconSrc = () => {
    if (isSelected || (hovered && !disabled)) {
      return iconHover;
    }
    return icon;
  };

  return (
    <button
      id={id}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      className={`
        group 
        ${width} ${height}
        flex flex-col items-center justify-center 
        rounded-[5px] border transition-all
        ${disabled 
          ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-60" 
          : isSelected 
            ? "bg-blue-50 border-blue-500" 
            : "bg-white border-gray-300 hover:border-blue-500"
        }
        ${className}
      `}
    >
      {/* ไอคอน */}
      <Image
        src={getIconSrc()}
        alt={label || "Icon"}
        width={32}
        height={32}
        className={`transition-all ${disabled ? "opacity-50" : ""}`}
      />

      {/* ข้อความ */}
      <span
        className={`mt-2 font-medium transition-all ${
          disabled
            ? "text-gray-400"
            : isSelected
            ? "text-blue-600"
            : hovered
            ? "text-blue-600"
            : "text-gray-500"
        }`}
      >
        {getDisplayText()}
      </span>
    </button>
  );
}