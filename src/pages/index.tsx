import ButtonGhost from "@/components/button/buttonghost";
import ButtonLarge from "@/components/button/buttonlarge";
import ButtonPrimary from "@/components/button/buttonprimary";
import ButtonSecondaryLarge from "@/components/button/buttonseclarge";
import ButtonSecondary from "@/components/button/buttonsecondary";


import { Footer } from "@/components/footer";
import StateList from "@/components/state_list and stepper/state_list";

import { Prompt } from "next/font/google";


const fonrPrompt = Prompt({
  //Set Font เพื่อใช้ทั้งระบบ ไม่ต้องลบส่วนนี้//
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: "600",
});

export default function Home() {
 

  return (
    //Set Font เพื่อใช้ทั้งระบบ ไม่ต้องลบส่วนนี้//
    <div className={fonrPrompt.className}>
       <StateList />
    </div>
    

  );
}
