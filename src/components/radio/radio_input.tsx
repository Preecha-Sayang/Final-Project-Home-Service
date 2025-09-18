import React, { useState } from 'react';
import CurrencyInput from '../input/currency_input';
import OkjaRadioComponent from './radio_botton';

interface OkjaRadioProps {
  id: string;                         
  name: string;                       
  value: string;                      
  checked?: boolean;                  
  disabled?: boolean;                 
  onChange?: (value: string) => void; 
  label: string;                     
}

function OkjaRadioExample({
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
        {/* วงกลมปุ่ม radio แบบ custom */}
        <span
          className={`
            relative w-5 h-5 mr-2 rounded-full border-2 bg-white transition-all duration-200
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
          {/* จุดสีน้ำเงินตรงกลางเมื่อถูกเลือก */}
          {checked && (
            <span
              className={`
                absolute top-1/2 left-1/2 w-2.5 h-2.5 rounded-full transform -translate-x-1/2 -translate-y-1/2
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
 * และมี currency input field ข้างๆ ปุ่ม radio
 */
export function OkjaRadioInput() {
  const [selectedValue, setSelectedValue] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <div className="space-y-3">
      {/* ปุ่ม Okja ที่สามารถแสดงทุกสถานะได้ */}
      <div className="flex items-center space-x-4">
          <OkjaRadioComponent
            id="okja-radio-input"
            name="okja-input-group"
            value="okja"
            label="Okja"
            checked={selectedValue === 'okja'}
            onChange={setSelectedValue}
          />
        
        {/* Currency Input Field ข้างๆ ปุ่ม radio */}
        <div className="flex-1 max-w-xs">
          <CurrencyInput
            value={amount}
            onChange={setAmount}
            placeholder="Enter amount"
          />
        </div>
      </div>
    </div>
  );
}

export default OkjaRadioExample;
