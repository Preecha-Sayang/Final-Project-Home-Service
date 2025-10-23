import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { cn } from "../../../lib/client/utils";

export interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface InputDropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  
  // Variant styles
  variant?: 'default' | 'compact' | 'inline';
  
  // Custom styles (สำหรับ override เฉพาะหน้า)
  buttonClassName?: string;
  optionsClassName?: string;
  optionClassName?: string;
  labelClassName?: string;
}

const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path 
      d="M5.8335 8.33337L10.0002 12.5L14.1668 8.33337H5.8335Z" 
      fill="#AAAAAA" 
    />
  </svg>
);

// Variant presets
const BUTTON_VARIANTS = {
  default: `
    w-full h-full text-left text-base font-medium 
    border border-[var(--gray-300)] rounded-md px-4 py-2.5
    hover:border-[var(--gray-400)]
    focus:outline-none focus:ring-1 focus:ring-[var(--blue-600)] cursor-pointer
  `,
  compact: `
    w-full text-left text-base font-medium pr-9
    hover:border-[var(--gray-400)]
    focus:outline-none focus:ring-2 focus:ring-[var(--blue-600)] cursor-pointer
  `,
  inline: `
    w-full text-left text-sm font-medium 
    border border-[var(--gray-200)] rounded px-3 py-1.5
    hover:border-[var(--gray-300)]
    focus:outline-none focus:ring-1 focus:ring-[var(--blue-500)] cursor-pointer
  `
};

const OPTIONS_VARIANTS = {
  default: 'h-[160px]',
  compact: 'max-h-60',
  inline: 'max-h-48'
};

export default function InputDropdown({
  label,
  value,
  onChange,
  options,
  placeholder = "เลือก...",
  disabled = false,
  className,
  variant = 'default',
  buttonClassName,
  optionsClassName,
  optionClassName,
  labelClassName
}: InputDropdownProps) {
  const selected = options.find(opt => opt.value === value);
  
  // Parse required indicator from label
  const labelContent = typeof label === 'string' ? (() => {
    const match = label.match(/^(.*?)(\s*\*)$/);
    if (match) {
      return (
        <>
          {match[1]}
          <span className="ml-1 text-[var(--red)]">*</span>
        </>
      );
    }
    return label;
  })() : label;
  
  return (
    <label className={cn("grid gap-2 w-full", className)}>
      {label && (
        <span className={cn(
          "text-xs font-light text-[var(--gray-500)]",
          labelClassName
        )}>
          {labelContent}
        </span>
      )}
      
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button
            className={cn(
              BUTTON_VARIANTS[variant],
              "text-[var(--gray-900)]",
              disabled && "bg-[var(--gray-100)] text-[var(--gray-500)] cursor-not-allowed border-[var(--gray-200)]",
              buttonClassName
            )}
          >
            {selected ? (
              selected.label
            ) : (
              <span className="text-[var(--gray-400)]">{placeholder}</span>
            )}
            
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-[var(--gray-500)]">
              <ChevronDownIcon />
            </span>
          </Listbox.Button>
          
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className={cn(
                "absolute z-50 mt-1 w-full overflow-auto rounded-md",
                "border border-[var(--gray-200)] bg-white shadow-lg",
                OPTIONS_VARIANTS[variant],
                optionsClassName
              )}
            >
              {options.map((opt) => (
                <Listbox.Option 
                  key={opt.value} 
                  value={opt.value} 
                  disabled={opt.disabled}
                >
                  {({ active, selected, disabled: isDisabled }) => (
                    <div
                      className={cn(
                        "cursor-pointer select-none rounded px-3 py-2 text-sm",
                        "text-[var(--gray-500)]",
                        active && "bg-[var(--gray-100)]",
                        selected && "font-medium text-[var(--gray-950)] bg-[var(--gray-100)]",
                        isDisabled && "opacity-50 cursor-not-allowed",
                        optionClassName
                      )}
                    >
                      {opt.label}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </label>
  );
}

/**
 * Usage Examples:
 * 
 * // Service page (compact variant)
 * <InputDropdown
 *   label="หมวดหมู่บริการ"
 *   variant="compact"
 *   value={category}
 *   onChange={setCategory}
 *   options={categories}
 * />
 * 
 * // Other pages (default variant with full styling)
 * <InputDropdown
 *   label="เลือกหมวดหมู่ *"
 *   variant="default"
 *   value={selected}
 *   onChange={handleChange}
 *   options={options}
 * />
 * 
 * // Custom override
 * <InputDropdown
 *   variant="compact"
 *   buttonClassName="py-1"
 *   optionClassName="text-xs"
 *   {...props}
 * />
 */