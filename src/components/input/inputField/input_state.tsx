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
    textarea?: boolean;

    // ใหม่
    validate?: (v: string) => string | null;
    validateOn?: "blur" | "change"; // ดีฟอลต์ blur
};

type NativeControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type ChildProps = {
    className?: string;
    disabled?: boolean;
    onChange?: React.ChangeEventHandler<NativeControl>;
    onBlur?: React.FocusEventHandler<NativeControl>;
};
type StylableChild = React.ReactElement<ChildProps>;

// ไอคอน error
const DefaultErrorIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14.3996 7.99961C14.3996 11.5342 11.5342 14.3996 7.99961 14.3996C4.46499 14.3996 1.59961 11.5342 1.59961 7.99961C1.59961 4.46499 4.46499 1.59961 7.99961 1.59961C11.5342 1.59961 14.3996 4.46499 14.3996 7.99961ZM8.79961 11.1996C8.79961 11.6414 8.44144 11.9996 7.99961 11.9996C7.55778 11.9996 7.19961 11.6414 7.19961 11.1996C7.19961 10.7578 7.55778 10.3996 7.99961 10.3996C8.44144 10.3996 8.79961 10.7578 8.79961 11.1996ZM7.99961 3.99961C7.55778 3.99961 7.19961 4.35778 7.19961 4.79961V7.99961C7.19961 8.44144 7.55778 8.79961 7.99961 8.79961C8.44144 8.79961 8.79961 8.44144 8.79961 7.99961V4.79961C8.79961 4.35778 8.44144 3.99961 7.99961 3.99961Z"
            fill="#B80000"
        />
    </svg>
);

const InputField = React.forwardRef<
    HTMLInputElement | HTMLTextAreaElement,
    InputFieldProps
>((props, ref) => {
    const {
        label, hint, error, status = "default",
        leftIcon, rightIcon, className, disabled,
        asChild, children,
        validate, validateOn = "blur",
        onChange, onBlur, value,
        textarea,          // <<< แยกออกมาก่อน
        ...rest            // <<< ส่วนที่ส่งลง DOM (จะไม่มี textarea แล้ว)
    } = props;

    const isDisabled = Boolean(disabled) || status === "disabled";
    const [touched, setTouched] = React.useState(false);

    // ค่าที่จะใช้ validate
    const stringValue =
        typeof value === "string"
            ? value
            : (typeof value === "number" ? String(value) : "");

    const computedError = validate ? validate(stringValue) ?? undefined : undefined;

    // แสดง error
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

    // generic handlers ที่ใช้ได้ทั้ง input/textarea
    const handleChangeAny: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
        if (validateOn === "change") setTouched(true);
        // cast ให้ onChange แบบเดิมยังใช้ได้
        (onChange as any)?.(e);
    };

    const handleBlurAny: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
        setTouched(true);
        (onBlur as any)?.(e);
    };

    const renderChild = () => {
        if (!(asChild && React.isValidElement(children))) return null;
        const child = children as StylableChild;

        const childOnChange: React.ChangeEventHandler<NativeControl> = (ev) => {
            handleChangeAny(ev as any);
            child.props.onChange?.(ev);
        };
        const childOnBlur: React.FocusEventHandler<NativeControl> = (ev) => {
            handleBlurAny(ev as any);
            child.props.onBlur?.(ev);
        };

        return React.cloneElement(child, {
            className: cn(styleClass, child.props.className),
            disabled: isDisabled || child.props.disabled,
            onChange: childOnChange,
            onBlur: childOnBlur,
        });
    };

    return (
        <div className="w-full">
            {label && (
                <label className={labelCls()}>
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
                    })() : label}
                </label>
            )}

            <div className="relative">
                {leftIcon && (
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--gray-400)]">
                        {leftIcon}
                    </span>
                )}

                {renderChild() ?? (
                    textarea ? (
                        <textarea
                            ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
                            disabled={isDisabled}
                            className={cn(styleClass, "min-h-[96px]")} // สูงขึ้นนิดให้เหมาะกับ textarea
                            onChange={handleChangeAny}
                            onBlur={handleBlurAny}
                            value={stringValue}
                            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                        />
                    ) : (
                        <input
                            ref={ref as React.ForwardedRef<HTMLInputElement>}
                            disabled={isDisabled}
                            className={styleClass}
                            onChange={handleChangeAny}
                            onBlur={handleBlurAny}
                            value={stringValue}
                            {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
                        />
                    )
                )}

                {(rightIcon || isError) && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--gray-400)]">
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
