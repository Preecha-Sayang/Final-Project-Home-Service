

interface RadioButtonProps {
  id: string;
  name: string;
  value: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
  label: string;
}

function RadioButton({
  id,
  name,
  value,
  checked = false,
  disabled = false,
  onChange,
  label
}: RadioButtonProps) {
  /**
   * ฟังก์ชันจัดการเมื่อมีการเปลี่ยนแปลงค่า
   * จะทำงานเฉพาะเมื่อปุ่มไม่ถูกปิดใช้งาน
   */
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = () => {

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
            ? 'cursor-not-allowed text-[var(--gray-400)]'
            : 'cursor-pointer text-[var(--gray-700)] hover:text-[var(--blue-500)]'
          }
        `}
      >
        {/* วงกลมปุ่ม radio แบบ custom - ขนาด 20px x 20px */}
        <span
          className={`
            relative w-[20px] h-[20px] mr-2 rounded-full border-2 bg-[var(--white)] transition-all duration-200
            ${disabled
              ? checked
                ? 'border-[var(--gray-300)] bg-[var(--gray-50)]'
                : 'border-[var(--gray-300)] bg-[var(--gray-50)]'
              : checked
                ? 'border-[var(--blue-500)] bg-[var(--white)]'
                : 'border-[var(--gray-300)] hover:border-[var(--blue-500)]'
            }
          `}
        >
          {/* จุดสีน้ำเงินตรงกลางเมื่อถูกเลือก - ขนาด 8px x 8px */}
          {checked && (
            <span
              className={`
                absolute top-1/2 left-1/2 w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2
                ${disabled ? 'bg-[var(--gray-400)]' : 'bg-[var(--blue-500)]'}
              `}
            />
          )}
        </span>
        {label}
      </label>
    </div>
  );
}

export default RadioButton;

/* ----------------------------------------------------
  วิธีใช้งาน RadioButton Component

  RadioButton Component เป็น custom radio button ที่มีสไตล์
  รองรับการใช้งานแบบ controlled และ uncontrolled
  มีการแสดงผลที่สอดคล้องกับ design system ของแอปพลิเคชัน
  ใช้สำหรับการเลือกตัวเลือกเดียวจากหลายตัวเลือก

  Props:
  - id: string (required) - ID ของ radio button (ต้องไม่ซ้ำกัน)
  - name: string (required) - ชื่อกลุ่มของ radio buttons (ต้องเหมือนกันในกลุ่ม)
  - value: string (required) - ค่าของ radio button
  - checked: boolean (optional) - สถานะการเลือก (default: false)
  - disabled: boolean (optional) - ปิดใช้งาน radio button (default: false)
  - onChange: function (optional) - ฟังก์ชันที่เรียกเมื่อมีการเปลี่ยนแปลงค่า
  - label: string (required) - ข้อความที่แสดงข้าง radio button

  ตัวอย่างการใช้งาน:

  1) การใช้งานพื้นฐาน:
     import RadioButton from "@/components/radio/radio_botton";
     
     const [selectedOption, setSelectedOption] = useState("");
     
     <div className="space-y-3">
       <RadioButton 
         id="option1"
         name="basic-options"
         value="option1"
         label="ตัวเลือกที่ 1"
         checked={selectedOption === "option1"}
         onChange={setSelectedOption}
       />
     </div>

  2) การใช้งานแบบ Disabled:
     <div className="space-y-2">
       <RadioButton 
         id="enabled-option"
         name="disabled-demo"
         value="enabled"
         label="ตัวเลือกที่ใช้งานได้"
         checked={true}
         onChange={(value) => console.log(value)}
       />
       <RadioButton 
         id="disabled-option"
         name="disabled-demo"
         value="disabled"
         label="ตัวเลือกที่ปิดใช้งาน"
         checked={false}
         disabled={true}
       />
     </div>


  การแสดงผล:
  - Radio button มีขนาด 20x20 pixels
  - สีน้ำเงินเมื่อถูกเลือก
  - สีเทาเมื่อปิดใช้งาน
  - มี hover effect เมื่อ hover
  - มี transition animation ที่นุ่มนวล
  - รองรับการแสดงผลแบบ responsive

  หมายเหตุ:
  - id ต้องไม่ซ้ำกันในหน้าเดียวกัน
  - name ต้องเหมือนกันในกลุ่ม radio buttons เดียวกัน
  - value ควรเป็นค่าที่ไม่ซ้ำกันในกลุ่ม
  - onChange จะไม่ทำงานเมื่อ disabled
  - รองรับการใช้งานแบบ controlled และ uncontrolled
  - ใช้กับ form libraries เช่น react-hook-form ได้

  การใช้งานกับ Form Libraries:
  
  React Hook Form:
     const { register, watch, setValue } = useForm();
     
     <RadioButton 
       id="form-radio"
       name="form-option"
       value="option1"
       label="ตัวเลือก 1"
       checked={watch('option') === 'option1'}
       onChange={(value) => setValue('option', value)}
     />

  Formik:
     <RadioButton 
       id="formik-radio"
       name="formik-option"
       value="option1"
       label="ตัวเลือก 1"
       checked={formik.values.option === 'option1'}
       onChange={(value) => formik.setFieldValue('option', value)}
     />

  การใช้งานแบบ Group Management:
     const [radioGroups, setRadioGroups] = useState({
       group1: "",
       group2: "",
       group3: ""
     });
     
     const handleGroupChange = (groupName: string, value: string) => {
       setRadioGroups(prev => ({
         ...prev,
         [groupName]: value
       }));
     };
     
     <div className="space-y-6">
       <div>
         <h3>กลุ่มที่ 1:</h3>
         <RadioButton 
           id="g1-option1"
           name="group1"
           value="option1"
           label="ตัวเลือก 1"
           checked={radioGroups.group1 === "option1"}
           onChange={(value) => handleGroupChange('group1', value)}
         />
       </div>
     </div>

---------------------------------------------------- */

