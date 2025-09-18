import React, { useState } from 'react';


/**
 * Props สำหรับคอมโพเนนต์ปุ่ม Radio Okja
 * @interface OkjaRadioProps
 */
interface OkjaRadioProps {
  id: string;                         // ID ของ input element
  name: string;                       // ชื่อกลุ่มของ radio button
  value: string;                      // ค่าที่จะส่งเมื่อถูกเลือก
  checked?: boolean;                  // สถานะการเลือก (เริ่มต้น: false)
  disabled?: boolean;                 // สถานะการปิดใช้งาน (เริ่มต้น: false)
  onChange?: (value: string) => void; // ฟังก์ชันที่จะทำงานเมื่อมีการเปลี่ยนแปลง
  label: string;                      // ข้อความที่แสดงข้างปุ่ม
}

/**
 * คอมโพเนนต์ปุ่ม Radio Button "Okja" สำหรับ Next.js ใช้ Tailwind CSS
 * มี 4 สถานะ: Default, Hover, Selected, Disabled
 * 
 * @param props - OkjaRadioProps
 * @returns JSX Element ของปุ่ม radio Okja
 */
export default function Okja({
  id,
  name,
  value,
  checked = false,
  disabled = false,
  onChange,
  label
}: OkjaRadioProps) {
  /**
   * ฟังก์ชันจัดการเมื่อมีการเปลี่ยนแปลงค่า
   * จะทำงานเฉพาะเมื่อปุ่มไม่ถูกปิดใช้งาน
   */
  const handleChange = () => {
    if (!disabled && onChange) {
      onChange(value);
    }
  };

  return (
    <div className="inline-block my-2">
      {/* Input element ที่ซ่อนไว้ */}
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
      />

      {/* Label ที่แสดงปุ่ม custom และข้อความ */}
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
        {/* วงกลมปุ่ม radio แบบ custom - ขนาด 20px x 20px */}
        <span
          className={`
            relative w-[20px] h-[20px] mr-2 rounded-full border-2 bg-white transition-all duration-200
            ${disabled
              ? checked
                ? 'border-gray-300 bg-gray-50'
                : 'border-gray-300 bg-gray-50'
              : checked
                ? 'border-blue-500 bg-white'
                : 'border-gray-300 hover:border-blue-500'
            }
          `}
        >
          {/* จุดสีน้ำเงินตรงกลางเมื่อถูกเลือก - ขนาด 8px x 8px */}
          {checked && (
            <span
              className={`
                absolute top-1/2 left-1/2 w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2
                ${disabled ? 'bg-gray-400' : 'bg-blue-500'}
              `}
            />
          )}
        </span>
        {label}
      </label>
    </div>
  );
}

/**
 * คอมโพเนนต์ตัวอย่างการใช้งานปุ่ม Okja ใช้ Tailwind CSS
 * แสดงปุ่มเดี่ยวที่มีทุกสถานะรวมกัน: Default, Hover, Selected, Disabled
 
 * 
 * @returns JSX Element ของตัวอย่างการใช้งาน
 */
export function OkjaRadio() {
  const [selectedValue, setSelectedValue] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <div className="space-y-3">
      {/* ปุ่ม Okja ที่สามารถแสดงทุกสถานะได้ */}
      <div className="flex items-center space-x-4">
        <Okja
          id="okja-button"
          name="okja-group"
          value="okja"
          label="Okja"
          checked={selectedValue === 'okja'}
          onChange={setSelectedValue}
        />
        
      </div>
    </div>
  );
}

