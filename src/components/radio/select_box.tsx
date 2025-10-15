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
          ? "bg-[var(--gray-100)] border-[var(--gray-200)] cursor-not-allowed opacity-60" 
          : isSelected 
            ? "bg-[var(--blue-50)] border-[var(--blue-500)]" 
            : "bg-[var(--white)] border-[var(--gray-300)] hover:border-[var(--blue-500)]"
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
            ? "text-[var(--gray-400)]"
            : isSelected
            ? "text-[var(--blue-600)]"
            : hovered
            ? "text-[var(--blue-600)]"
            : "text-[var(--gray-500)]"
        }`}
      >
        {getDisplayText()}
      </span>
    </button>
  );
}

/**
 * วิธีใช้งาน SelectBox Component
 * 
 * SelectBox Component เป็นคอมโพเนนต์ที่ใช้สำหรับการเลือกตัวเลือกต่างๆ
 * มีไอคอนและข้อความที่เปลี่ยนแปลงตามสถานะ (ปกติ, hover, selected)
 * 
 * คุณสมบัติหลัก:
 * - ไอคอนที่เปลี่ยนแปลงตามสถานะ
 * - ข้อความที่เปลี่ยนแปลงตามสถานะ
 * - รองรับการปิดใช้งาน (disabled state)
 * - รองรับ controlled และ uncontrolled mode
 * - Hover effects และ transitions
 * - Customizable size และ styling
 * 
 * ตัวอย่างการใช้งาน:
 * 
 * 1) การใช้งานพื้นฐาน - การเลือกวิธีการชำระเงิน:
 *    const [selectedPayment, setSelectedPayment] = useState("");
 *    
 *    <div className="flex gap-4">
 *      <SelectBox
 *        id="qr-payment"
 *        label="QR Code"
 *        icon="/images/icon_qr.svg"
 *        iconHover="/images/qr_code_2_blue_24dp 1 (2).svg"
 *        selected={selectedPayment === "qr"}
 *        onClick={(selected) => setSelectedPayment(selected ? "qr" : "")}
 *      />
 *    </div>
 
 * 
 * 2) การใช้งานแบบ Disabled:
 *    <div className="flex gap-4">
 *      <SelectBox
 *        id="enabled-option"
 *        label="ใช้งานได้"
 *        icon="/images/icon_qr.svg"
 *        iconHover="/images/qr_code_2_blue_24dp 1 (2).svg"
 *        selected={true}
 *        onClick={(selected) => console.log(selected)}
 *      />
 *      <SelectBox
 *        id="disabled-option"
 *        label="ปิดใช้งาน"
 *        icon="/images/icon_qr.svg"
 *        iconHover="/images/qr_code_2_blue_24dp 1 (2).svg"
 *        selected={false}
 *        disabled={true}
 *      />
 *    </div>
 
 * การแสดงผล:
 * - ไอคอนแสดงด้านบน
 * - ข้อความแสดงด้านล่าง
 * - สีและสไตล์เปลี่ยนแปลงตามสถานะ
 * - รองรับ responsive design
 * - มี hover และ focus states
 * - รองรับ disabled state
 * 
 * สถานะต่างๆ:
 * - Default: สีเทา, ไอคอนปกติ
 * - Hover: สีน้ำเงิน, ไอคอน hover
 * - Selected: พื้นหลังน้ำเงินอ่อน, เส้นขอบน้ำเงิน, ไอคอน hover
 * - Disabled: สีเทา, opacity ลดลง, cursor not-allowed
 * 
 * Best Practices:
 * 1. ใช้ id ที่ไม่ซ้ำกันสำหรับแต่ละ select box
 * 2. จัดการ state ให้เหมาะสมกับ use case
 * 3. ใช้ไอคอนที่เหมาะสมกับฟังก์ชันการทำงาน
 * 4. ใช้ label ที่ชัดเจนและเข้าใจง่าย
 * 5. ตรวจสอบ accessibility (alt text สำหรับไอคอน)
 * 6. ใช้ controlled mode เมื่อต้องการควบคุม state จากภายนอก
 * 
 * การใช้งานกับ Form Libraries:
 * 
 * React Hook Form:
 * ```tsx
 * const { register, watch, setValue } = useForm();
 * const selectedValue = watch("paymentMethod");
 * 
 * <SelectBox
 *   id="qr"
 *   label="QR Code"
 *   icon="/images/icon_qr.svg"
 *   iconHover="/images/qr_code_2_blue_24dp 1 (2).svg"
 *   selected={selectedValue === "qr"}
 *   onClick={(selected) => setValue("paymentMethod", selected ? "qr" : "")}
 * />
 */