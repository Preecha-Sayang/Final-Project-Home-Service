import React, { useState } from 'react';

/**
 * Props สำหรับคอมโพเนนต์ Checkbox
 * @interface CheckboxProps
 */
interface CheckboxProps {
  id: string;                         // ID ของ input element
  checked?: boolean;                  // สถานะการเลือก (เริ่มต้น: false)
  disabled?: boolean;                 // สถานะการปิดใช้งาน (เริ่มต้น: false)
  onChange?: (checked: boolean) => void; // ฟังก์ชันที่จะทำงานเมื่อมีการเปลี่ยนแปลง
  label?: string;                     // ข้อความที่แสดงข้างปุ่ม (optional)
  className?: string;                 // CSS classes เพิ่มเติม
}

/**
 * คอมโพเนนต์ Checkbox สำหรับ Next.js ใช้ Tailwind CSS
 * มี 4 สถานะ: Default, Hover, Checked, Disabled
 * 
 * @param props - CheckboxProps
 * @returns JSX Element ของ checkbox
 */
export default function Checkbox({
  id,
  checked = false,
  disabled = false,
  onChange,
  label,
  className = ''
}: CheckboxProps) {
  /**
   * ฟังก์ชันจัดการเมื่อมีการเปลี่ยนแปลงค่า
   * จะทำงานเฉพาะเมื่อ checkbox ไม่ถูกปิดใช้งาน
   */
  const handleChange = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div className={`inline-block my-2 ${className}`}>
      {/* Input element ที่ซ่อนไว้ */}
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
      />

      {/* Label ที่แสดง checkbox custom และข้อความ */}
      <label
        htmlFor={id}
        className={`
          flex items-center text-sm font-normal select-none transition-all duration-200
          ${disabled
            ? 'cursor-not-allowed text-gray-400'
            : 'cursor-pointer text-gray-700 hover:text-gray-900'
          }
        `}
      >
         {/* สี่เหลี่ยม checkbox แบบ custom - ขนาด 20px x 20px */}
         <span
           className={`
             relative w-[20px] h-[20px] mr-2 rounded-md border-2 bg-white transition-all duration-200 flex items-center justify-center
             ${disabled
               ? checked
                 ? 'border-gray-300 bg-gray-200'
                 : 'border-gray-300 bg-gray-100'
               : checked
                 ? 'border-blue-500 bg-blue-500'
                 : 'border-gray-300 hover:border-blue-500'
             }
           `}
         >
          {/* เครื่องหมายถูกเมื่อถูกเลือก */}
          {checked && (
            <span
              className={`
                absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                ${disabled ? 'bg-blue-500' : 'text-white drop-shadow-sm'}
              `}
            >
               <svg
                 width="16"
                 height="12"
                 viewBox="0 0 16 12"
                 fill="none"
                 xmlns="http://www.w3.org/2000/svg"
                 className="w-4 h-3"
               >
                 <path
                   d="M2 6L6 10L14 2"
                   stroke="currentColor"
                   strokeWidth="2.5"
                   strokeLinecap="round"
                   strokeLinejoin="round"
                 />
               </svg>
            </span>
          )}
        </span>
        {label}
      </label>
    </div>
  );
}

/**
 * คอมโพเนนต์ตัวอย่างการใช้งาน Checkbox
 * แสดง checkbox เดี่ยวที่มีทุกสถานะรวมกัน: Default, Hover, Checked, Disabled
 * 
 * @returns JSX Element ของตัวอย่างการใช้งาน
 */
export function CheckboxExample() {
  const [isChecked, setIsChecked] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  return (
    <div className="space-y-6">
      {/* Checkbox เดียวที่แสดงทุกสถานะ */}
      <div className="space-y-4">
        
        {/* Checkbox Interactive */}
        <Checkbox
          id="checkbox-interactive"
          checked={isChecked}
          disabled={isDisabled}
          onChange={setIsChecked}
          label="Checkbox"
        />
        
        
      </div>
    </div>
  );
}
