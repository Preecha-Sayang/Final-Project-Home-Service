import { useState } from "react";

interface ButtonProps {
  onClick?: () => void | Promise<void | boolean>;
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

function ButtonPrimary({ onClick, disabled,className, children, type = "button" }: ButtonProps) {
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
    w-[160px] h-[45px] px-[24px] py-[10px] text-[16px] font-medium rounded-xl
    box-border border-none flex items-center justify-center gap-2
     transition-colors duration-200
  `;

  // 
  const normalClass = `
    bg-[var(--blue-600)] text-[var(--white)]
    hover:bg-[var(--blue-500)] active:bg-[var(--blue-800)]
    cursor-pointer
  `;

  // 
  const disabledClass = `
    bg-[var(--gray-400)] text-[var(--gray-100)] 
    cursor-not-allowed
  `;

  // 
  const loadingClass = `
    bg-[var(--blue-600)] text-[var(--white)] cursor-not-allowed opacity-70
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
      {isLoading ? (
        <>
        <span>Processing</span>
        <div className="w-4 h-4 border-2 border-[var(--white)] border-t-transparent rounded-full animate-spin"></div>
        </>
      ):<span>{children}</span>}
    </button>
  );
}

export default ButtonPrimary;

// //วิธ๊ใช้    < ButtonSecondary  disabled={true} onClick={async () => {
//   await new Promise(res => setTimeout(res, 2000)); // โหลด 2 วินาที
// }}>
//   Submit
// </ ButtonSecondary>