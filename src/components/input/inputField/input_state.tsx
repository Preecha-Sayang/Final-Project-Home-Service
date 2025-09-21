import * as React from "react";
import {
    base, ring, state, cn, labelCls, messageCls, InputStatus,
} from "../_style";

export type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    hint?: string;
    error?: string;
    status?: InputStatus;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    asChild?: boolean;
    children?: React.ReactNode;
    required?: boolean;

    // ใหม่
    validate?: (v: string) => string | null;
    validateOn?: "blur" | "change"; // ดีฟอลต์ blur
};

// ไอคอน error เริ่มต้น (ถ้า caller ไม่ส่ง rightIcon มา)
const DefaultErrorIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M14.3996 7.99961C14.3996 11.5342 11.5342 14.3996 7.99961 14.3996C4.46499 14.3996 1.59961 11.5342 1.59961 7.99961C1.59961 4.46499 4.46499 1.59961 7.99961 1.59961C11.5342 1.59961 14.3996 4.46499 14.3996 7.99961ZM8.79961 11.1996C8.79961 11.6414 8.44144 11.9996 7.99961 11.9996C7.55778 11.9996 7.19961 11.6414 7.19961 11.1996C7.19961 10.7578 7.55778 10.3996 7.99961 10.3996C8.44144 10.3996 8.79961 10.7578 8.79961 11.1996ZM7.99961 3.99961C7.55778 3.99961 7.19961 4.35778 7.19961 4.79961V7.99961C7.19961 8.44144 7.55778 8.79961 7.99961 8.79961C8.44144 8.79961 8.79961 8.44144 8.79961 7.99961V4.79961C8.79961 4.35778 8.44144 3.99961 7.99961 3.99961Z" fill="#B80000" />
    </svg>

);

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>((props, ref) => {
    const {
        label, hint, error, status = "default",
        leftIcon, rightIcon, className, disabled,
        asChild, children,
        validate, validateOn = "blur",
        onChange, onBlur, value,
        ...rest
    } = props;

    const isDisabled = Boolean(disabled) || status === "disabled";
    const [touched, setTouched] = React.useState(false);

    // ค่าที่จะใช้ validate (รองรับทั้ง controlled & uncontrolled)
    const stringValue =
        typeof value === "string"
            ? value
            : (typeof value === "number" ? String(value) : "");

    const computedError =
        validate ? validate(stringValue) ?? undefined : undefined;

    // แสดง error ตามกฎ: ถ้ามี error ที่ส่งเข้ามาให้ override, otherwise ใช้ของ validate เมื่อ touched หรือ validateOn='change'
    const shouldShowComputed = validate
        ? (validateOn === "change" ? true : touched)
        : false;

    const finalError = error ?? (shouldShowComputed ? computedError : undefined);
    const isError = Boolean(finalError) || status === "error";

    const styleClass = cn(
        base,
        ring,
        isDisabled ? state.disabled : isError ? state.error : state[status],
        !!leftIcon && "pl-9",
        !!rightIcon && isError ? "pr-9" : !!rightIcon && "pr-9",
        className
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (validateOn === "change") setTouched(true);
        onChange?.(e);
    };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setTouched(true);
        onBlur?.(e);
    };

    return (
        <div className="w-full">
            {label && (
                <label className={labelCls()}>
                    {typeof label === "string" ? (() => {
                        // ถ้ามี * ท้ายข้อความ ให้แยกออกมาแล้วทำสีแดง
                        const m = label.match(/^(.*?)(\s*\*)$/);
                        if (m) {
                            return (
                                <>
                                    {m[1]}
                                    <span className="ml-1 text-red-600">*</span>
                                </>
                            );
                        }
                        return label;
                    })() : label}
                </label>
            )}

            <div className="relative">
                {leftIcon && (
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        {leftIcon}
                    </span>
                )}

                {asChild && React.isValidElement(children) ? (
                    React.cloneElement(children as any, {
                        className: cn(styleClass, (children as any).props?.className),
                        disabled: isDisabled || (children as any).props?.disabled,
                        onChange: (e: any) => { handleChange(e); (children as any).props?.onChange?.(e); },
                        onBlur: (e: any) => { handleBlur(e); (children as any).props?.onBlur?.(e); },
                    })
                ) : (
                    <input
                        ref={ref}
                        disabled={isDisabled}
                        className={styleClass}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={value as any}
                        {...rest}
                    />
                )}

                {(rightIcon || isError) && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                        {/* ถ้ามี rightIcon ให้แสดงตามนั้น, ถ้า error แต่ไม่ได้ส่งไอคอนมา ให้ขึ้นไอคอน default */}
                        {rightIcon ?? (isError ? <DefaultErrorIcon /> : null)}
                    </span>
                )}
            </div>

            {isError ? (
                <p className={messageCls(true)}>{finalError}</p>
            ) : hint ? (
                <p className={messageCls()}>{hint}</p>
            ) : null}
        </div>
    );
});

InputField.displayName = "InputField";
export default InputField;
