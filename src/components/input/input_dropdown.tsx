"use client";
import * as React from "react";
import InputField from "./input_state";

export type Option = { label: string; value: string; disabled?: boolean };

type Shared = {
    label?: string;
    hint?: string;
    error?: string;
    status?: "default" | "success" | "error" | "disabled";
    className?: string;
    disabled?: boolean;
};

export type DropdownProps =
    Shared & {
        options: Option[];
        value?: string;
        onChange?: (value: string) => void;
        placeholder?: string;
    } & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange">;

export default function InputDropdown({
    label,
    hint,
    error,
    status,
    options,
    value,
    onChange,
    placeholder = "เลือก...",
    className,
    disabled,
    ...rest
}: DropdownProps) {
    return (
        <InputField
            asChild
            label={label}
            hint={hint}
            error={error}
            status={status}
            disabled={disabled}
            className={className}
        >
            <select
                value={value ?? ""}
                onChange={(e) => onChange?.(e.target.value)}
                {...rest}
            >
                <option value="" disabled hidden>
                    {placeholder}
                </option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </InputField>
    );
}
