import React, { useState } from 'react';
import RadioButton from './radio_botton';

/**
 * Props สำหรับ RadioButtonWithInput Component
 * 
 * @interface RBIProps
 * @property {string} id - ID ที่ไม่ซ้ำกันสำหรับ radio button
 * @property {string} name - ชื่อกลุ่มของ radio button (ใช้สำหรับการจัดกลุ่ม)
 * @property {string} value - ค่าที่จะส่งเมื่อเลือก radio button นี้
 * @property {boolean} [checked=false] - สถานะการเลือกของ radio button
 * @property {boolean} [disabled=false] - สถานะการปิดใช้งาน
 * @property {(value: string) => void} [onChange] - ฟังก์ชันที่เรียกเมื่อมีการเปลี่ยนแปลงการเลือก
 * @property {(value: string) => void} [onInputChange] - ฟังก์ชันที่เรียกเมื่อมีการเปลี่ยนแปลงค่าใน input field
 * @property {string} [className] - CSS class เพิ่มเติมสำหรับ input field
 * @property {string} [placeholder] - ข้อความ placeholder สำหรับ input field
 * @property {string} [inputValue] - ค่าปัจจุบันใน input field
 * @property {string} label - ข้อความที่แสดงข้าง radio button
 * @property {string} [postfix='฿'] - ข้อความที่แสดงด้านขวาของ input field (เช่น สกุลเงิน)
 */
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
 * RadioButtonWithInput Component
 * 
 * คอมโพเนนต์ที่รวม radio button กับ input field เข้าด้วยกัน
 * เหมาะสำหรับการเลือกตัวเลือกพร้อมกับการป้อนข้อมูลเพิ่มเติม
 * เช่น การเลือกวิธีการชำระเงินพร้อมการป้อนจำนวนเงิน
 * 
 * คุณสมบัติ:
 * - Radio button ที่สามารถเลือกได้
 * - Input field สำหรับป้อนข้อมูลเพิ่มเติม
 * - รองรับการปิดใช้งาน (disabled state)
 * - มี postfix (เช่น สัญลักษณ์สกุลเงิน) แสดงด้านขวาของ input
 * - สไตล์ที่สอดคล้องกับ design system
 * 
 * การใช้งาน:
 * 1. การเลือกวิธีการชำระเงินพร้อมจำนวนเงิน
 * 2. การเลือกบริการพร้อมระบุจำนวน/ราคา
 * 3. การเลือกตัวเลือกพร้อมการป้อนข้อมูลเพิ่มเติม
 * 
 * ตัวอย่างการใช้งาน:
 * ```tsx
 * const [selectedPayment, setSelectedPayment] = useState("");
 * const [amount, setAmount] = useState("");
 * 
 * <RadioButtonWithInput
 *   id="cash-payment"
 *   name="payment-method"
 *   value="cash"
 *   label="เงินสด"
 *   checked={selectedPayment === "cash"}
 *   onChange={setSelectedPayment}
 *   inputValue={amount}
 *   onInputChange={setAmount}
 *   placeholder="ระบุจำนวนเงิน"
 *   postfix="฿"
 * />
 * ```
 * 
 * @param {RBIProps} props - Properties ของ component
 * @returns {JSX.Element} RadioButtonWithInput component
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
    postfix = '฿'
}: RBIProps) {
    /**
     * ฟังก์ชันจัดการเมื่อมีการเปลี่ยนแปลงค่าใน input field
     * จะทำงานเฉพาะเมื่อ input ไม่ถูกปิดใช้งาน
     */
    const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        if (!disabled && onInputChange) {
            onInputChange(e.target.value);
        }
    };

    return (
        <div className="space-y-3">
            {/* Radio Button พร้อม Input Field */}
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
                
                {/* Input Field สำหรับป้อนข้อมูลเพิ่มเติม */}
                <div className="flex-1 max-w-xs">
                    <div className={`relative ${className}`}>
                        <input
                            type="text"
                            value={inputValue || ""}
                            onChange={handleInputChange}
                            placeholder={placeholder}
                            disabled={disabled}
                            className={`
                                w-full h-[42px] pt-[9px] pr-[13px] pb-[9px] pl-[13px]
                                bg-[var(--gray-100)] 
                                border border-[var(--gray-300)] 
                                rounded-[6px] 
                                text-sm 
                                text-[var(--gray-700)]
                                placeholder-[var(--gray-400)]
                                focus:outline-none 
                                focus:ring-2 
                                focus:ring-[var(--blue-500)] 
                                focus:border-transparent
                                transition-all duration-200
                                shadow-sm
                                ${disabled
                                    ? 'cursor-not-allowed bg-[var(--gray-50)] text-[var(--gray-400)]'
                                    : 'hover:bg-[var(--gray-50)]'
                                }
                            `}
                        />

                        {/* Postfix (เช่น สัญลักษณ์สกุลเงิน) ด้านขวา */}
                        <div className="absolute right-[13px] top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <span className="text-[var(--gray-500)] text-sm font-medium">{postfix}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * วิธีใช้งาน RadioButtonWithInput Component
 * 
 * RadioButtonWithInput Component เป็นคอมโพเนนต์ที่รวม radio button กับ input field
 * เหมาะสำหรับการเลือกตัวเลือกพร้อมกับการป้อนข้อมูลเพิ่มเติม
 * 
 * คุณสมบัติหลัก:
 * - Radio button สำหรับเลือกตัวเลือก
 * - Input field สำหรับป้อนข้อมูลเพิ่มเติม
 * - รองรับการปิดใช้งาน (disabled state)
 * - มี postfix แสดงด้านขวาของ input (เช่น สัญลักษณ์สกุลเงิน)
 * - สไตล์ที่สอดคล้องกับ design system
 * 
 * ตัวอย่างการใช้งาน:
 * 
 * 1) การใช้งานพื้นฐาน - การเลือกวิธีการชำระเงิน:
 *    const [selectedPayment, setSelectedPayment] = useState("");
 *    const [amount, setAmount] = useState("");
 *    
 *    <div className="space-y-4">
 *      <RadioButtonWithInput
 *        id="cash-payment"
 *        name="payment-method"
 *        value="cash"
 *        label="เงินสด"
 *        checked={selectedPayment === "cash"}
 *        onChange={setSelectedPayment}
 *        inputValue={amount}
 *        onInputChange={setAmount}
 *        placeholder="ระบุจำนวนเงิน"
 *        postfix="฿"
 *      />
 *    </div>
 * 
 * 2) การใช้งานแบบ Disabled:
 *    <div className="space-y-3">
 *      <RadioButtonWithInput
 *        id="enabled-option"
 *        name="demo"
 *        value="enabled"
 *        label="ตัวเลือกที่ใช้งานได้"
 *        checked={true}
 *        onChange={(value) => console.log(value)}
 *        inputValue="1000"
 *        onInputChange={(value) => console.log(value)}
 *        placeholder="ระบุจำนวน"
 *        postfix="฿"
 *      />
 *      <RadioButtonWithInput
 *        id="disabled-option"
 *        name="demo"
 *        value="disabled"
 *        label="ตัวเลือกที่ปิดใช้งาน"
 *        checked={false}
 *        disabled={true}
 *        inputValue=""
 *        placeholder="ไม่สามารถป้อนข้อมูลได้"
 *        postfix="฿"
 *      />
 *    </div>
 * 
 * การแสดงผล:
 * - Radio button แสดงด้านซ้าย
 * - Input field แสดงด้านขวาของ radio button
 * - Postfix แสดงด้านขวาของ input field
 * - รองรับ responsive design
 * - มี hover และ focus states
 * - รองรับ disabled state
 * 
 * Best Practices:
 * 1. ใช้ name เดียวกันสำหรับ radio button ที่อยู่ในกลุ่มเดียวกัน
 * 2. ใช้ id ที่ไม่ซ้ำกันสำหรับแต่ละ radio button
 * 3. จัดการ state ให้เหมาะสมกับ use case
 * 4. ใช้ placeholder ที่ชัดเจนและเข้าใจง่าย
 * 5. เลือก postfix ที่เหมาะสมกับข้อมูลที่ป้อน
 * 6. ตรวจสอบ validation ของข้อมูลที่ป้อนใน input field
 * 
 * การใช้งานกับ Form Libraries:
 * 
 * React Hook Form:
 * ```tsx
 * const { register, watch, setValue } = useForm();
 * const selectedValue = watch("paymentMethod");
 * const inputValue = watch("amount");
 * 
 * <RadioButtonWithInput
 *   id="cash"
 *   name="paymentMethod"
 *   value="cash"
 *   label="เงินสด"
 *   checked={selectedValue === "cash"}
 *   onChange={(value) => setValue("paymentMethod", value)}
 *   inputValue={inputValue}
 *   onInputChange={(value) => setValue("amount", value)}
 *   placeholder="ระบุจำนวนเงิน"
 *   postfix="฿"
 * />
 */

