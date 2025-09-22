import Image from "next/image";
import { useState } from "react";

interface Step {
    id: number;
    title: string;
    icon: string;
  };

export default function Stepper() {

    const steps: Step[] = [
        { id: 1, title: "รายการ", icon:"/images/icon_document.svg" },
        { id: 2, title: "กรอกข้อมูลบริการ", icon:"/images/icon_document.svg" },
        { id: 3, title: "ชำระเงิน", icon:"/images/icon_document.svg" }
    ]

    return (
        <div>

        </div>
    )
};