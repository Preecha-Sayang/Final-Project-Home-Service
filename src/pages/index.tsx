import StateList from "@/components/state_list and stepper/state_list";
import Stepper from "@/components/state_list and stepper/stepper";

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
       <Stepper />
       <StateList />
    </div>
    

  );
}
