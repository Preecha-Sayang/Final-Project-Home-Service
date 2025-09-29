// Alert - Confirmation
import React from "react";

type Props = {
    open: boolean;
    title?: string;
    description?: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
};

export default function ConfirmDialog({
    open,
    title = "ยืนยันการลบรายการ?",
    description,
    confirmLabel = "ลบรายการ",
    cancelLabel = "ยกเลิก",
    loading = false,
    onConfirm,
    onCancel,
}: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <button
                    onClick={onCancel}
                    className="float-right -mt-2 -mr-2 rounded-md p-2 text-[var(--gray-400)] hover:bg-[var(--gray-100)] hover:text-[var(--gray-600)] cursor-pointer"
                    aria-label="close"
                >
                    ✕
                </button>

                <div className="mb-3 flex justify-center">
                    <div className="flex h-10 w-10 items-center justify-center">
                        <svg width="36" height="36" viewBox="0 0 30 30" fill="none">
                            <path fillRule="evenodd" clipRule="evenodd" d="M29.3996 15.0001C29.3996 18.8192 27.8825 22.4819 25.1819 25.1824C22.4814 27.883 18.8187 29.4001 14.9996 29.4001C11.1805 29.4001 7.5178 27.883 4.81727 25.1824C2.11675 22.4819 0.599609 18.8192 0.599609 15.0001C0.599609 11.181 2.11675 7.51828 4.81727 4.81776C7.5178 2.11724 11.1805 0.600098 14.9996 0.600098C18.8187 0.600098 22.4814 2.11724 25.1819 4.81776C27.8825 7.51828 29.3996 11.181 29.3996 15.0001ZM16.7996 22.2001C16.7996 22.6775 16.61 23.1353 16.2724 23.4729C15.9348 23.8105 15.477 24.0001 14.9996 24.0001C14.5222 24.0001 14.0644 23.8105 13.7268 23.4729C13.3893 23.1353 13.1996 22.6775 13.1996 22.2001C13.1996 21.7227 13.3893 21.2649 13.7268 20.9273C14.0644 20.5897 14.5222 20.4001 14.9996 20.4001C15.477 20.4001 15.9348 20.5897 16.2724 20.9273C16.61 21.2649 16.7996 21.7227 16.7996 22.2001ZM14.9996 6.0001C14.5222 6.0001 14.0644 6.18974 13.7268 6.52731C13.3893 6.86487 13.1996 7.32271 13.1996 7.8001V15.0001C13.1996 15.4775 13.3893 15.9353 13.7268 16.2729C14.0644 16.6105 14.5222 16.8001 14.9996 16.8001C15.477 16.8001 15.9348 16.6105 16.2724 16.2729C16.61 15.9353 16.7996 15.4775 16.7996 15.0001V7.8001C16.7996 7.32271 16.61 6.86487 16.2724 6.52731C15.9348 6.18974 15.477 6.0001 14.9996 6.0001Z" fill="#C82438" />
                        </svg>
                    </div>
                </div>

                {/* text */}
                <h3 className="mb-1 text-center text-lg font-semibold text-[var(--gray-900)]">{title}</h3>
                {description && (
                    <p className="mb-5 text-center text-md text-[var(--gray-600)]">{description}</p>
                )}

                {/* actions */}
                <div className="flex justify-center gap-3">
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="min-w-[120px] rounded-lg bg-[var(--blue-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--blue-700)] disabled:opacity-60 cursor-pointer"
                    >
                        {loading ? "กำลังลบ..." : confirmLabel}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="min-w-[120px] rounded-lg border border-[var(--blue-500)] px-4 py-2 text-sm font-medium text-[var(--blue-600)] hover:bg-[var(--blue-100)] disabled:opacity-60 cursor-pointer"
                    >
                        {cancelLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
