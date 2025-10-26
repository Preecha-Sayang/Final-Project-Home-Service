import React from "react";
import { X } from "lucide-react";

type Props = {
    open: boolean;
    title?: string;
    description?: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    tone?: "accept" | "decline";
    icon?: React.ReactNode;
};

export default function ConfirmDialogDanger({
    open,
    title,
    description,
    confirmLabel = "ยืนยัน",
    cancelLabel = "ยกเลิก",
    onConfirm,
    onCancel,
    tone = "accept",
    icon,
}: Props) {
    if (!open) return null;

    const isAccept = tone === "accept";

    const defaultIcon = isAccept ? (
        // จดหมายสีน้ำเงิน
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <g clipPath="url(#clip0_15170_9572)">
                <path fillRule="evenodd" clipRule="evenodd" d="M25.5 4.5C26.6478 4.49994 27.7523 4.93849 28.5874 5.72593C29.4225 6.51336 29.9252 7.59016 29.9925 8.736L30 9V15.525L30.891 15.129C31.812 14.7195 32.874 15.354 32.991 16.326L33 16.5V28.5C33.0002 29.2569 32.7144 29.9859 32.1998 30.5408C31.6851 31.0958 30.9797 31.4357 30.225 31.4925L30 31.5H6C5.24314 31.5002 4.51415 31.2144 3.95918 30.6998C3.40421 30.1851 3.06426 29.4797 3.0075 28.725L3 28.5V16.5C3 15.492 4.0125 14.7795 4.9455 15.0675L5.1105 15.129L6 15.525V9C5.99994 7.85218 6.43849 6.74773 7.22593 5.91261C8.01336 5.07749 9.09016 4.57484 10.236 4.5075L10.5 4.5H25.5ZM30 18.8085L19.218 23.5995C18.8345 23.7699 18.4196 23.8579 18 23.8579C17.5804 23.8579 17.1655 23.7699 16.782 23.5995L6 18.81V28.5H30V18.8085ZM25.5 7.5H10.5C10.1022 7.5 9.72064 7.65804 9.43934 7.93934C9.15803 8.22064 9 8.60218 9 9V16.8585L18 20.859L27 16.8585V9C27 8.60218 26.842 8.22064 26.5607 7.93934C26.2794 7.65804 25.8978 7.5 25.5 7.5ZM18 12C18.3823 12.0004 18.75 12.1468 19.0281 12.4093C19.3061 12.6717 19.4734 13.0304 19.4958 13.4121C19.5182 13.7938 19.394 14.1696 19.1486 14.4627C18.9032 14.7559 18.5551 14.9443 18.1755 14.9895L18 15H15C14.6177 14.9996 14.25 14.8532 13.9719 14.5907C13.6939 14.3283 13.5266 13.9696 13.5042 13.5879C13.4818 13.2062 13.606 12.8304 13.8514 12.5373C14.0968 12.2441 14.4449 12.0557 14.8245 12.0105L15 12H18Z" fill="#336DF2" />
            </g>
        </svg>

    ) : (
        // ตรึงตกใจสีแดง
        <svg width="36" height="36" viewBox="0 0 30 30" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M29.3996 15.0001C29.3996 18.8192 27.8825 22.4819 25.1819 25.1824C22.4814 27.883 18.8187 29.4001 14.9996 29.4001C11.1805 29.4001 7.5178 27.883 4.81727 25.1824C2.11675 22.4819 0.599609 18.8192 0.599609 15.0001C0.599609 11.181 2.11675 7.51828 4.81727 4.81776C7.5178 2.11724 11.1805 0.600098 14.9996 0.600098C18.8187 0.600098 22.4814 2.11724 25.1819 4.81776C27.8825 7.51828 29.3996 11.181 29.3996 15.0001ZM16.7996 22.2001C16.7996 22.6775 16.61 23.1353 16.2724 23.4729C15.9348 23.8105 15.477 24.0001 14.9996 24.0001C14.5222 24.0001 14.0644 23.8105 13.7268 23.4729C13.3893 23.1353 13.1996 22.6775 13.1996 22.2001C13.1996 21.7227 13.3893 21.2649 13.7268 20.9273C14.0644 20.5897 14.5222 20.4001 14.9996 20.4001C15.477 20.4001 15.9348 20.5897 16.2724 20.9273C16.61 21.2649 16.7996 21.7227 16.7996 22.2001ZM14.9996 6.0001C14.5222 6.0001 14.0644 6.18974 13.7268 6.52731C13.3893 6.86487 13.1996 7.32271 13.1996 7.8001V15.0001C13.1996 15.4775 13.3893 15.9353 13.7268 16.2729C14.0644 16.6105 14.5222 16.8001 14.9996 16.8001C15.477 16.8001 15.9348 16.6105 16.2724 16.2729C16.61 15.9353 16.7996 15.4775 16.7996 15.0001V7.8001C16.7996 7.32271 16.61 6.86487 16.2724 6.52731C15.9348 6.18974 15.477 6.0001 14.9996 6.0001Z" fill="#C82438" />
        </svg>
    );

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30">
            <div className="w-[360px] h-[270px] rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        aria-label="Close"
                        className="rounded p-1 text-[var(--gray-500)] hover:bg-[var(--gray-100)] cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex flex-col items-center text-center px-3 -mt-2">
                    {icon ?? defaultIcon}

                    {title && (
                        <h3 className="text-base font-semibold text-[var(--gray-900)]">{title}</h3>
                    )}

                    {description && (
                        <div className="mt-3 text-base text-[var(--gray-700)]">
                            {typeof description === "string" ? <p>{description}</p> : description}
                        </div>
                    )}

                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={onConfirm}
                            className={`min-w-[160px] h-[40px] rounded-lg px-4 text-sm font-medium text-white ${isAccept
                                ? "bg-[var(--blue-600)] hover:bg-[var(--blue-700)]/90 cursor-pointer"
                                : "bg-[var(--red)] hover:bg-[var(--red)]/90 cursor-pointer"
                                }`}
                        >
                            {confirmLabel}
                        </button>

                        <button
                            type="button"
                            onClick={onCancel}
                            className="min-w-[120px] h-[40px] rounded-lg border border-[var(--gray-300)] bg-white px-4 text-sm font-medium text-[var(--gray-800)] hover:bg-[var(--gray-100)] cursor-pointer"
                        >
                            {cancelLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
