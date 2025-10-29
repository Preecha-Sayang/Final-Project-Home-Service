import React from "react";
import type { CategoryRow } from "@/types/category";
import CategoryColorBadge from "./CategoryColorBadge";

type Props = {
    item: Pick<CategoryRow, "name" | "bg_color_hex" | "text_color_hex" | "ring_color_hex">;
    onEdit?: () => void;
};

export default function CategoryPreview({ item, onEdit }: Props) {
    return (
        <div className="rounded-2xl border border-[var(--gray-100)] bg-white p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <div className="text-lg font-semibold">{item.name}</div>
                {!!onEdit && (
                    <button
                        type="button"
                        onClick={onEdit}
                        className="rounded-lg bg-[var(--blue-600)] px-4 py-2 text-white"
                    >
                        แก้ไข
                    </button>
                )}
            </div>

            <div className="flex items-center gap-4">
                <span
                    className="inline-block h-8 w-12 rounded"
                    style={{ backgroundColor: item.bg_color_hex }}
                />
                <span
                    className="inline-block h-8 w-12 rounded border"
                    style={{ backgroundColor: item.text_color_hex }}
                    title="text sample"
                />
                <CategoryColorBadge
                    bg={item.bg_color_hex}
                    text={item.text_color_hex}
                    ring={item.ring_color_hex}
                />
            </div>
        </div>
    );
}