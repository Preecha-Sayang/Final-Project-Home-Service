"use client";
import * as React from "react";
import { base, ring, state, cn, labelCls, messageCls, InputStatus } from "./input_style";

export type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    hint?: string;
    error?: string;
    status?: InputStatus;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    asChild?: boolean;
    children?: React.ReactNode;
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
        const isDisabled = disabled || status === "disabled";

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
                            // แปลง children อีกทีนึง
                            const child = children as React.ReactElement<any>;

                            const supportsDisabled =
                                typeof child.type === "string" &&
                                ["input", "select", "textarea", "button", "optgroup", "option", "fieldset"].includes(child.type);

                            const cloneProps: any = {
                                className: cn(styleClass, child.props?.className),
                            };

                            if (supportsDisabled) {
                                cloneProps.disabled = isDisabled ?? child.props?.disabled;
                            }

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
