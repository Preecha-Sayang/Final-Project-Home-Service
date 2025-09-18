import React, { useState } from 'react';

interface OkjaRadioProps {
  id: string;                         
  name: string;                       
  value: string;                     
  checked?: boolean;                 
  disabled?: boolean;                 
  onChange?: (value: string) => void; 
  label: string;                      
}

function OkjaRadio({
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

// สร้าง example component สำหรับใช้ในหน้า index
export function Okja() {
  const [selectedValue, setSelectedValue] = useState('');

  return (
    <OkjaRadio
      id="okja-radio"
      name="okja-group"
      value="okja"
      label="Okja"
      checked={selectedValue === 'okja'}
      onChange={setSelectedValue}
    />
  );
}

export default OkjaRadio;

