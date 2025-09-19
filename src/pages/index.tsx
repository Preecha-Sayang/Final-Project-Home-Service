import ButtonGhost from "@/components/button/buttonghost";
import ButtonLarge from "@/components/button/buttonlarge";
import ButtonPrimary from "@/components/button/buttonprimary";
import ButtonSecondaryLarge from "@/components/button/buttonseclarge";
import ButtonSecondary from "@/components/button/buttonsecondary";
import BookingForm from "@/components/input/use_index";

import { Footer } from "@/components/footer";

import { Prompt } from "next/font/google";

const fonrPrompt = Prompt({
  //Set Font เพื่อใช้ทั้งระบบ ไม่ต้องลบส่วนนี้//
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: "600",
});

export default function Home() {
  return (
    <div className={fonrPrompt.className}>
      <div className="flex gap-3 flrx-col">
        <BookingForm />
      </div>
      <ButtonGhost
        disabled={true}
        onClick={async () => {
          await new Promise((res) => setTimeout(res, 2000)); // โหลด 2 วินาที
        }}
      >
        Submit
      </ButtonGhost>

      <div>
        <Footer />
      </div>
    </div>
  );
}
