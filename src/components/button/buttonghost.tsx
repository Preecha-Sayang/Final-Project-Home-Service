import { useState } from "react";

interface ButtonProps {
  onClick?: () => void | Promise<void | boolean>;
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

function ButtonGhost({ onClick, disabled,className, children, type = "button" }: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!onClick) return;
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  const baseClass = `
    text-[16px] font-[600] text-[var(--blue-600)]
    box-border underline flex items-center justify-center gap-2
    cursor-pointer transition-colors duration-200
  `;

  // 
  const normalClass = `
  hover:text-[var(--blue-400)]  active:text-[var(--blue-800)]
  `;

  // 
  const disabledClass = `
    text-[var(--gray-400)] 
    cursor-not-allowed
  `;

  // 
  const loadingClass = `
     cursor-not-allowed opacity-70 text-[var(--blue-600)] 
  `;

  return (
    <button
      onClick={handleClick}
      type={type}
      disabled={disabled || isLoading}
      className={`
        ${baseClass} ${className}
        ${disabled ? disabledClass : isLoading ? loadingClass : normalClass}
      `}
    >
        <span>{children}</span>
      {isLoading && (
        <>
        <div className="w-4 h-4 border-2 border-[var(--blue-600)] border-t-transparent rounded-full animate-spin"></div>
        </>
      )}
    </button>
  );
}

export default ButtonGhost;

// //วิธ๊ใช้    < ButtonSecondary  disabled={true} onClick={async () => {
//   await new Promise(res => setTimeout(res, 2000)); // โหลด 2 วินาที
// }}>
//   Submit
// </ ButtonSecondary>