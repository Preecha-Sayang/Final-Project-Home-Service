import React from "react";
import type { HexColor } from "@/types/category";

type Props = {
    bg: HexColor;
    text: HexColor;
    ring: HexColor;
};

export default function CategoryColorBadge({ bg, text, ring}: Props) {
    return (
        <span className="inline-flex items-center px-2 h-6 rounded ring-2"
                style={{
                    backgroundColor: bg,
                    color: text,
                    boxShadow: ` 0 0 0 2px ${ring}`
                }}
                title={`bg ${bg} / text ${text} / ring ${ring}`}>

        </span>
    )
}