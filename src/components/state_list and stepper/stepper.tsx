import React from "react";
import Image from "next/image";
//  const { useState } = React;

interface Step {
  id: number;
  title: string;
  icon: string;
}

export default function Stepper({ currentStep = 1 }: { currentStep?: number }) {
  const steps: Step[] = [
    { id: 1, title: "รายการ", icon: "/images/icon_document.svg" },
    { id: 2, title: "กรอกข้อมูลบริการ", icon: "/images/icon_edit.svg" },
    { id: 3, title: "ชำระเงิน", icon: "/images/icon_payment.svg" },
  ];

  return (
    <div className="flex justify-center w-full p-2">
      {/* กรอบ stepper */}
      <div className="w-full max-w bg-white border border-gray-200 rounded-xl  p-6">
        {/* cake ปรับ padding stepper */}
        <div className="relative flex items-center px-40">
          {/* เส้นเชื่อมพื้นหลัง - วางไว้ข้างหลัง */}
          {/* cake ปรับ padding เส้น stepper  */}
          <div className="absolute top-8 left-0 right-0 flex items-center px-36">
            <div className="w-full h-1 bg-gray-300 rounded-full ml-8 mr-8" />
          </div>

          {/* เส้นเชื่อมที่มีสี - วางไว้ข้างหลัง */}
          {/* cake ปรับ padding เส้น stepper  */}
          <div className="absolute top-8 left-0 right-0 flex items-center px-36">
            <div
              className="h-1 bg-blue-500 rounded-full transition-all duration-700 ease-out ml-8"
              style={{
                width:
                  currentStep > 1
                    ? currentStep === 2
                      ? "calc(50% - 32px)"
                      : "calc(100% - 64px)"
                    : "0%",
              }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex items-center justify-between w-full cursor-pointer">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div key={step.id} className="flex flex-col items-center z-10">
                  {/* วงกลม + ไอคอน */}
                  <div
                    className={`w-16 h-16 flex items-center justify-center rounded-full border-4 transition-all duration-300 mb-4 bg-white
                      ${
                        isActive
                          ? "border-[var(--blue-500)] bg-[var(--blue-500)]"
                          : isCompleted
                          ? "border-[var(--blue-500)] bg-[var(--blue-500)]"
                          : "border-[var(--gray-300)] bg-[var(--white)]"
                      }`}
                  >
                    <Image
                      src={step.icon}
                      alt={step.title}
                      width={24}
                      height={24}
                      className={`w-6 h-6 transition-all duration-300 ${
                        isActive || isCompleted
                          ? "text-[var(--blue-500)]"
                          : "text-[var(--blue-500)]"
                      }`}
                    />
                  </div>

                  {/* ชื่อ step */}
                  <span
                    className={`text-sm font-medium text-center transition-all duration-300 max-w-28 leading-tight
                      ${
                        isActive
                          ? "text-var-[var(--blue-500)] font-semibold"
                          : isCompleted
                          ? "text-[var(--blue-500)]"
                          : "text-[var(--gray-700)]"
                      }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
