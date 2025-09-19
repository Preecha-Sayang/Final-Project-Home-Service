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
    /** ใช้ element อื่นแทน <input> เช่น <select>, <textarea> */
    asChild?: boolean;
    children?: React.ReactNode;
};

type StylableControlProps = { className?: string; disabled?: boolean };
type StylableControl = React.ReactElement<StylableControlProps>;

const isNativeFormTag = (t: unknown): t is string =>
    typeof t === "string" &&
    ["input", "select", "textarea", "button", "optgroup", "option", "fieldset"].includes(t);

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(({
    label, hint, error, status = "default", leftIcon, rightIcon, className, disabled,
    asChild, children, ...props
}, ref) => {
    // isError/isDisabled เดิม
    const isError = Boolean(error) || status === "error";
    const isDisabled = Boolean(disabled) || status === "disabled";

    const styleClass = cn(
        base,
        ring,
        isDisabled ? state.disabled : isError ? state.error : state[status],
        !!leftIcon && "pl-9",
        !!rightIcon && "pr-9",
        className
    );

    return (
        <div className="w-full">
            {label && <label className={labelCls()}>{label}</label>}

            <div className="relative">
                {/* ไอคอนซ้าย (ภาพมีช่องว่างด้านซ้าย) */}
                {leftIcon && (
                    <span className="pointer-events-none absolute left-0 inset-y-0 flex items-center pl-3 text-[var(--gray-400)]">
                        {leftIcon}
                    </span>
                )}

                {asChild && React.isValidElement(children) ? (
                    (() => {
                        const child = children as StylableControl;
                        const cloneProps: StylableControlProps = {
                            className: cn(
                                styleClass,
                                // ถ้าเป็น select native ให้ theme ตามภาพ (เสริมคลาส .tw-select)
                                isNativeFormTag((child as React.ReactElement).type) ? "tw-select" : "",
                                child.props?.className
                            ),
                            disabled: isNativeFormTag((child as React.ReactElement).type)
                                ? isDisabled || child.props?.disabled
                                : child.props?.disabled,
                        };
                        return React.cloneElement(child, cloneProps);
                    })()
                ) : (
                    <input ref={ref} disabled={isDisabled} className={styleClass} {...props} />
                )}

                {/* ไอคอนขวา */}
                {rightIcon && (
                    <span className="absolute right-0 inset-y-0 flex items-center pr-3 text-[var(--gray-400)]">
                        {rightIcon}
                    </span>
                )}
            </div>

            {/* ข้อความใต้ช่อง (รูปมี error message สีแดง) */}
            {isError ? (
                <p className={messageCls(true)}>{error}</p>
            ) : hint ? (
                <p className={messageCls()}>{hint}</p>
            ) : null}
        </div>
    );
});

InputField.displayName = "InputField";
export default InputField;
