import { useState } from "react";
import Image from "next/image";

function IconBell() {
  const [isLoading, setIsLoading] = useState(false);

  function handleClick() {
    setIsLoading(!isLoading);
  }

  return (
    <button
      className={`
        w-[40px] h-[40px]
        box-border
        ${isLoading ? "bg-[var(--gray-100)]" : "bg-[var(--blue-100)]"}
        rounded-full
        border-none
        flex justify-center items-center
        hover:bg-[var(--gray-200)]
        active:bg-[var(--gray-300)]
        transition-colors duration-200
        cursor-pointer
      `}
      onClick={handleClick}
      type="button"
    >
      <Image
        src={
          isLoading
            ? "./images/icon_bell_gray.svg"
            : "./images/icon_bell_blue.svg"
        }
        alt="bell_alert"
        width={13}
        height={18}
      />
    </button>
  );
}

export default IconBell;
