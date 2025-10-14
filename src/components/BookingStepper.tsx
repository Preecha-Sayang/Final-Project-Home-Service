import React from "react";
// Utility function for conditional classes
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
import { List, Edit3, CreditCard } from "lucide-react";

export const STEPS_DATA = [
  { id: "items", name: "รายการ", icon: List },
  { id: "details", name: "กรอกข้อมูลบริการ", icon: Edit3 },
  { id: "payment", name: "ชำระเงิน", icon: CreditCard },
];

interface BookingStepperProps {
  currentStepId: string;
  steps?: typeof STEPS_DATA;
}

const BookingStepper: React.FC<BookingStepperProps> = ({
  currentStepId,
  steps = STEPS_DATA,
}) => {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStepId);

  return (
    <div className="w-full -mt-8 md:-mt-12 mb-6 relative z-10">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const isActive = step.id === currentStepId;
            const isCompleted = index < currentStepIndex;
            const IconComponent = step.icon;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center text-center flex-shrink-0">
                  <div
                    className={cn(
                      "w-12 h-12 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 mb-2 transition-all duration-200",
                      isActive
                        ? "w-15 h-15 bg-white border-blue-600 text-blue-600 shadow-lg scale-110"
                        : isCompleted
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-gray-300 text-gray-400",
                    )}
                  >
                    <IconComponent size={isActive ? 22 : 18} className="md:w-6 md:h-6" />
                  </div>
                  <span
                    className={cn(
                      "text-xs md:text-base font-medium px-1 md:px-2 whitespace-nowrap leading-tight",
                      isActive || isCompleted
                        ? "text-blue-600"
                        : "text-gray-400",
                      (isActive || isCompleted) && "font-semibold",
                    )}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1">
                    <div
                      className={cn(
                        "h-0.5 md:h-1 rounded-full transition-all duration-300",
                        isCompleted ? "bg-blue-600" : "bg-gray-300",
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BookingStepper;