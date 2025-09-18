import React, { useState } from 'react';

interface SelectBoxProps {
  id: string;
  value?: string;
  label?: string;
  selected?: boolean;
  disabled?: boolean;
  onChange?: (selected: string) => void;
  className?: string;                 
}

function SelectBox({
  id,
  value = "",
  label = "label",
    selected = false,
  disabled = false,
  onChange,
  className = ''
}: SelectBoxProps) {
  /**
   * ฟังก์ชันจัดการเมื่อมีการเปลี่ยนแปลงค่า
   * จะทำงานเฉพาะเมื่อ select box ไม่ถูกปิดใช้งาน
   */
  const handleChange = () => {
    if (!disabled && onChange) {
      onChange(value);
    }
  };

  return (
    <div className={`inline-block ${className}`}>
      {/* Input element ที่ซ่อนไว้ */}
      <input
        type="radio"
        id={id}
        checked={selected}
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
      />

      {/* Label ที่แสดง select box custom และข้อความ */}
      <label
        htmlFor={id}
        className={`
          group flex flex-col items-center justify-center w-[227px] h-[86px] rounded-[5px] border transition-all duration-200 cursor-pointer
          ${disabled
            ? 'cursor-not-allowed opacity-60'
            : selected
              ? 'border-blue-500 bg-blue-50'
              : 'border-white hover:border-blue-500'
          }
        `}
      >
          {/* ไอคอน Barcode */}
          <div className="w-12 h-12 mb-1">
            <img 
              src="/images/icon_qr.svg" 
              alt="Barcode" 
              className={`
                w-full h-full object-contain transition-all duration-200
                ${disabled
                  ? 'brightness-0 saturate-100 invert-[66%] sepia-[8%] hue-rotate-[202deg] contrast-[89%]'
                  : selected
                    ? 'brightness-0 saturate-100 invert-[27%] sepia-[51%] hue-rotate-[346deg] contrast-[97%]'
                    : 'brightness-0 saturate-100 invert-[66%] sepia-[8%] hue-rotate-[202deg] contrast-[89%] group-hover:brightness-0 group-hover:saturate-100 group-hover:invert-[27%] group-hover:sepia-[51%] group-hover:hue-rotate-[346deg] group-hover:contrast-[97%]'
                }
              `}
            />
          </div>
          <div className="text-center">
              {label}
          </div>
      </label>
    </div>
  );
}

export default SelectBox;
