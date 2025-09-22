import { useState } from "react";

interface ButtonProps {
  onClick?: () => void | Promise<void | boolean>;
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

function ButtonSecondaryLarge({ onClick, disabled,className, children,type = "button" }: ButtonProps) {
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
    w-[310px] h-[55px] px-[32px] py-[12px] text-[16px] font-medium rounded-xl
    box-border border-[1px]  flex items-center justify-center gap-2
    cursor-pointer transition-colors duration-200
  `;

  // 
  const normalClass = `
    bg-[var(--white)] text-[var(--blue-600)]
    hover:text-[var(--blue-400)] active:text-[var(--blue-800)]
  `;

  // 
  const disabledClass = `
    bg-[var(--gray-100)] text-[var(--gray-400)] 
    cursor-not-allowed
  `;

  // 
  const loadingClass = `
  text-[var(--blue-600)] cursor-not-allowed opacity-70 !w-[200px]
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
        <div className="w-4 h-4 border-2  border-t-transparent rounded-full animate-spin"></div>
        </>
      ):<span>{children}</span>}
    </button>
  );
}

export default ButtonSecondaryLarge;
// //วิธ๊ใช้    < ButtonSecondary  disabled={true} onClick={async () => {
//   await new Promise(res => setTimeout(res, 2000)); // โหลด 2 วินาที
// }}>
//   Submit
// </ ButtonSecondary>