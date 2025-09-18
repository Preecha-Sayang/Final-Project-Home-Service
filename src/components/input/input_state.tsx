"use client";
import * as React from "react";
import {
    base,
    ring,
    state,
    cn,
    labelCls,
    messageCls,
    InputStatus,
} from "./input_style";

export type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    hint?: string;
    error?: string;
    status?: InputStatus;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    /** ส่ง children เพื่อใช้ element อื่นแทน <input> (เช่น <select>, <textarea>, หรือ input จาก lib ภายนอก) */
    asChild?: boolean;
    children?: React.ReactNode;
};

// element ชนิดที่เราจะ clone และอัด className/disabled เข้าไป
type StylableControlProps = {
    className?: string;
    disabled?: boolean;
};
type StylableControl = React.ReactElement<StylableControlProps>;

// ฟังก์ชันช่วยเช็คว่าเป็น native form control ที่รองรับ disabled
const isNativeFormTag = (type: unknown): type is string => {
    return (
        typeof type === "string" &&
        ["input", "select", "textarea", "button", "optgroup", "option", "fieldset"].includes(
            type
        )
    );
};

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
    (
        {
            label,
            hint,
            error,
            status = "default",
            leftIcon,
            rightIcon,
            className,
            disabled,
            asChild,
            children,
            ...props
        },
        ref
    ) => {
        const isError = Boolean(error) || status === "error";
        const isDisabled = Boolean(disabled) || status === "disabled";

        const styleClass = cn(
            base,
            ring,
            isDisabled ? state.disabled : isError ? state.error : state[status],
            leftIcon ? "pl-9" : undefined,
            rightIcon ? "pr-9" : undefined,
            className
        );

        return (
            <div className="w-full">
                {label && <label className={labelCls()}>{label}</label>}

                <div className="relative">
                    {leftIcon && (
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            {leftIcon}
                        </span>
                    )}

                    {asChild && React.isValidElement(children) ? (
                        (() => {
                            const child = children as StylableControl;

                            // เตรียม prop สำหรับอัดเข้าไปใน child
                            const cloneProps: StylableControlProps = {
                                className: cn(styleClass, child.props?.className),
                                // จะใส่ disabled ต่อเมื่อเป็น native tag (กันกรณี lib ภายนอกไม่รับ prop นี้)
                                disabled: isNativeFormTag((child as React.ReactElement).type)
                                    ? isDisabled || child.props?.disabled
                                    : child.props?.disabled,
                            };

                            return React.cloneElement(child, cloneProps);
                        })()
                    ) : (
                        <input
                            ref={ref}
                            disabled={isDisabled}
                            className={styleClass}
                            {...props}
                        />
                    )}

                    {rightIcon && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                            {rightIcon}
                        </span>
                    )}
                </div>

                {isError ? (
                    <p className={messageCls(true)}>{error}</p>
                ) : hint ? (
                    <p className={messageCls()}>{hint}</p>
                ) : null}
            </div>
        );
    }
);

InputField.displayName = "InputField";
export default InputField;
