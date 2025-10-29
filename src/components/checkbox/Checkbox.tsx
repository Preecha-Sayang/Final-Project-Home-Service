import { useState } from "react";

interface CheckboxProps {
  id: number;
  label: string;
  defaultChecked?: boolean;
}

export default function Checkbox({
  id,
  label,
  defaultChecked = false,
}: CheckboxProps) {
  const [checked, setChecked] = useState(defaultChecked);

  const handleChange = async () => {
    const newValue = !checked;
    setChecked(newValue);
  };

  return (
    <div className="flex items-center space-x-2 px-12 py-24">
      <input
        id={`check-${id}`}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="h-5 w-5 rounded border-[var(--grey-300)] text-[var(--blue-600)] focus:ring-2 focus:ring-[var(--blue-500)]"
      />
      <label
        htmlFor={`check-${id}`}
        className="text-sm text-[var(--gray-700)] cursor-pointer"
      >
        {label}
      </label>
    </div>
  );
}
