import React, { useState } from 'react';

/**
 * Props สำหรับคอมโพเนนต์ Currency Input
 * @interface CurrencyInputProps
 */
interface CurrencyInputProps {
  value?: string;                        // ค่าปัจจุบันของ input
  onChange?: (value: string) => void;    // ฟังก์ชันที่จะทำงานเมื่อมีการเปลี่ยนแปลง
  placeholder?: string;                  // ข้อความ placeholder
  disabled?: boolean;                    // สถานะการปิดใช้งาน
  className?: string;                    // CSS classes เพิ่มเติม
}

/**
 * คอมโพเนนต์ Currency Input สำหรับใส่จำนวนเงินพร้อมสัญลักษณ์บาท
 * ออกแบบให้เหมือนกับในรูปภาพ: input สีเทาอ่อน, มุมโค้ง, มีสัญลักษณ์ ฿ ด้านขวา
 * 
 * @param props - CurrencyInputProps
 * @returns JSX Element ของ currency input
 */
export default function CurrencyInput({
  value = '',
  onChange,
  placeholder = '',
  disabled = false,
  className = ''
}: CurrencyInputProps) {
  const [inputValue, setInputValue] = useState(value);

  /**
   * ฟังก์ชันจัดการเมื่อมีการเปลี่ยนแปลงค่า input
   * อนุญาตเฉพาะตัวเลขและจุดทศนิยม
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // อนุญาตเฉพาะตัวเลข, จุดทศนิยม, และ backspace
    if (/^\d*\.?\d*$/.test(newValue) || newValue === '') {
      setInputValue(newValue);
      if (onChange) {
        onChange(newValue);
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
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
        <span className="text-gray-500 text-sm font-medium">฿</span>
      </div>
    </div>
  );
}

/**
 * คอมโพเนนต์ตัวอย่างการใช้งาน Currency Input
 * 
 * @returns JSX Element ของตัวอย่างการใช้งาน
 */
export function CurrencyInputExample() {
  const [amount, setAmount] = useState('');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-700">Currency Input Example</h3>
      <CurrencyInput
        value={amount}
        onChange={setAmount}
        placeholder="Enter amount"
      />
      <p className="text-sm text-gray-500">Entered amount: {amount}฿</p>
    </div>
  );
}
