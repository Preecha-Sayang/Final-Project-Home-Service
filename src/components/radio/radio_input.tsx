import React, { useState } from 'react';
import RadioButton from './radio_botton';



interface RBIProps {
    id: string;
    name: string;
    value: string;
    checked?: boolean;
    disabled?: boolean;
    onChange?: (value: string) => void;
    onInputChange?: (value: string) => void;
    className?: string;
    placeholder?: string;
    inputValue?: string;
    label: string;
    postfix?: string;
}

/**
 * คอมโพเนนต์ตัวอย่างการใช้งานปุ่ม Okja ใช้ Tailwind CSS
 * แสดงปุ่มเดี่ยวที่มีทุกสถานะรวมกัน: Default, Hover, Selected, Disabled
 * และมี currency input field ข้างๆ ปุ่ม radio
 */
export function RadioButtonWithInput({
    id,
    name,
    value,
    checked,
    disabled,
    onChange,
    onInputChange,
    className,
    placeholder,
    inputValue,
    label,
     postfix = '฿'}: RBIProps) {


  return (
    <div className="space-y-3">
      {/* ปุ่ม Okja ที่สามารถแสดงทุกสถานะได้ */}
      <div className="flex items-center space-x-4">
          <RadioButton
            id={id}
            name={name}
            value={value}
            label={label}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
          />
        
        {/* Currency Input Field ข้างๆ ปุ่ม radio */}
        <div className="flex-1 max-w-xs">
            <div className={`relative ${className}`}>
                <input
                    type="text"
                    value={inputValue}
                    // onChange={onInputChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
          w-full h-[42px] pt-[9px] pr-[13px] pb-[9px] pl-[13px]
          bg-gray-100 
          border border-gray-300 
          rounded-[6px] 
          text-sm 
          text-gray-700
          placeholder-gray-400
          focus:outline-none 
          focus:ring-2 
          focus:ring-blue-500 
          focus:border-transparent
          transition-all duration-200
          shadow-sm
          ${disabled
                        ? 'cursor-not-allowed bg-gray-50 text-gray-400'
                        : 'hover:bg-gray-50'
                    }
        `}
                />

                {/* สัญลักษณ์บาท (฿) ด้านขวา */}
                <div className="absolute right-[13px] top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <span className="text-gray-500 text-sm font-medium">{postfix}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

