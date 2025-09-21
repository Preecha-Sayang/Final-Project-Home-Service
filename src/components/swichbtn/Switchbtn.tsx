import { useState } from "react";

export default function Switchbtn() {
  const [switchOn, setSwitchOn] = useState(false);

  return (
    <div className="flex flex-item items-center justify-center gap-10">
      {/* เปิดปิด */}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setSwitchOn(!switchOn)}
          className={`w-16 h-8 rounded-full p-1 flex items-center transition-colors duration-300 ${
            switchOn
              ? "bg-[var(--blue-500)] justify-end"
              : "bg-[var(--gray-300)] justify-start"
          }`}
        >
          <div className="h-6 w-6 bg-[var(--white)] rounded-full shadow-md transition-transform duration-300"></div>
        </button>
        <span className="text-sm">{switchOn ? "" : ""}</span>
      </div>
    </div>
  );
}
