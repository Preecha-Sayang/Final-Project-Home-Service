import React, { useState } from 'react';

/**
 * Props สำหรับคอมโพเนนต์ Select Box
 * @interface SelectBoxProps
 */
interface SelectBoxProps {
  id: string;                         // ID ของ input element
  selected?: boolean;                 // สถานะการเลือก (เริ่มต้น: false)
  disabled?: boolean;                 // สถานะการปิดใช้งาน (เริ่มต้น: false)
  onChange?: (selected: boolean) => void; // ฟังก์ชันที่จะทำงานเมื่อมีการเปลี่ยนแปลง                    // ข้อความที่แสดงข้างปุ่ม (optional)
  className?: string;                 // CSS classes เพิ่มเติม
}

/**
 * คอมโพเนนต์ Select Box สำหรับ Next.js ใช้ Tailwind CSS
 * มี 3 สถานะ: Default, Hover, Selected
 * 
 * @param props - SelectBoxProps
 * @returns JSX Element ของ select box
 */
export default function SelectBox({
  id,
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
      onChange(!selected);
    }
  };

  return (
    <div className={`inline-block ${className}`}>
      {/* Input element ที่ซ่อนไว้ */}
      <input
        type="checkbox"
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
          <div className="w-12 h-12 mb-3">
            <img 
              src="/barcode.svg.svg" 
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
      </label>
    </div>
  );
}

/**
 * คอมโพเนนต์ตัวอย่างการใช้งาน Select Box
 * แสดง select box เดี่ยวที่มีทุกสถานะรวมกัน: Default, Hover, Selected
 * 
 * @returns JSX Element ของตัวอย่างการใช้งาน
 */
export function SelectBoxExample() {
  const [isSelected, setIsSelected] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  return (
    <div className="space-y-6">
      {/* Select Box เดียวที่แสดงทุกสถานะ */}
      <div className="space-y-4">
        
        {/* Select Box Interactive */}
        <div className="flex justify-center">
          <SelectBox
            id="select-box-interactive"
            selected={isSelected}
            disabled={isDisabled}
            onChange={setIsSelected}
            
          />
        </div>
    
      </div>
    </div>
  );
}
