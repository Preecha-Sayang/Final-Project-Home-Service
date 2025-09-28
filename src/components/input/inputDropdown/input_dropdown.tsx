import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { cn } from "../../../../lib/client/utils";

export type Option = { label: string; value: string; disabled?: boolean };

type Props = {
    label?: string;
    value: string;
    onChange: (v: string) => void;
    options: Option[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    optionClassName?: string;
};

function ChevronDownIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
        ><path d="M5.8335 8.33337L10.0002 12.5L14.1668 8.33337H5.8335Z" fill="#AAAAAA" />
        </svg>
    );
}

export default function InputDropdown({
    label, value, onChange, options,
    placeholder = "Select…",
    disabled,
    className, optionClassName,
}: Props) {
    const selected = options.find(o => o.value === value) ?? null;

    return (
        <label className="grid gap-2">
            {label && <span className="text-sm font-medium text-[var(--gray-800)]">
                {typeof label === "string" ? (() => {
                    // ถ้ามี * ท้ายข้อความ จะเป็นสีแดง
                    const m = label.match(/^(.*?)(\s*\*)$/);
                    if (m) {
                        return (
                            <>
                                {m[1]}
                                <span className="ml-1 text-[var(--red)]">*</span>
                            </>
                        );
                    }
                    return label;
                })() : label}</span>}

            <Listbox value={value} onChange={onChange} disabled={disabled}>
                <div className={cn("relative", className)}>
                    <Listbox.Button
                        className={cn(
                            "w-full rounded-md border px-3 py-2 text-left text-sm",
                            "border-[var(--gray-300)] text-[var(--gray-900)]",
                            "hover:border-[var(--gray-400)]",
                            "focus:outline-none focus:ring-2 focus:ring-[var(--blue-600)]",
                            "pr-9",
                            disabled &&
                            "bg-[var(--gray-100)] text-[var(--gray-500)] cursor-not-allowed border-[var(--gray-200)]"
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
                            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md
                         border border-[var(--gray-200)] bg-white shadow-lg"
                        >
                            {options.map((opt) => (
                                <Listbox.Option key={opt.value} value={opt.value} disabled={opt.disabled}>
                                    {({ active, selected, disabled }) => (
                                        <div
                                            className={cn(
                                                "cursor-pointer select-none rounded px-3 py-2 text-sm text-[var(--gray-500)]",
                                                active && "bg-[var(--gray-100)]",
                                                selected && "font-medium text-[var(--gray-950)] bg-[var(--gray-100)]",
                                                disabled && "opacity-50 cursor-not-allowed",
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