import { useState } from "react";

interface ButtonProps {
  onClick?: () => Promise<void> | void;
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

function ButtonLarge({ onClick, disabled,className, children }: ButtonProps) {
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
    w-[280px] h-[55px] px-[32px] py-[12px] text-[20px] font-medium rounded-xl
    box-border border-none flex items-center justify-center gap-2
  `;

  // 
  const normalClass = `
    bg-[var(--blue-600)] text-[var(--white)]
    hover:bg-[var(--blue-500)] active:bg-[var(--blue-800)]
  `;

  // 
  const disabledClass = `
    bg-[var(--gray-300)] text-[var(--gray-100)] 
    cursor-not-allowed
  `;

  // 
  const loadingClass = `
    bg-[var(--blue-600)] text-[var(--white)] cursor-not-allowed opacity-70 !w-[200px]
  `;

  return (
    <button
      onClick={handleClick}
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

export default  ButtonLarge;

// //วิธ๊ใช้    < ButtonSecondary  disabled={true} onClick={async () => {
//   await new Promise(res => setTimeout(res, 2000)); // โหลด 2 วินาที
// }}>
//   Submit
// </ ButtonSecondary>