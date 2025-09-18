"use client";
import * as React from "react";
import InputField, { InputFieldProps } from "./input_state";

export type DatePickerProps = Omit<InputFieldProps, "type" | "value" | "onChange"> & {
  value?: string; // 'YYYY-MM-DD'
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
};

export default function DatePicker({
  label,
  hint,
  error,
  status,
  value,
  onChange,
  min,
  max,
  disabled,
  ...rest
}: DatePickerProps) {
  return (
    <InputField
      type="date"
      label={label}
      hint={hint}
      error={error}
      status={status}
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange?.(e.currentTarget.value)}
      disabled={disabled}
      {...rest}
    />
  );
}
