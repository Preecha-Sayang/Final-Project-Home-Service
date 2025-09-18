import ButtonGhost from "@/components/button/buttonghost";
import ButtonLarge from "@/components/button/buttonlarge";
import ButtonPrimary from "@/components/button/buttonprimary";
import ButtonSecondaryLarge from "@/components/button/buttonseclarge";
import ButtonSecondary from "@/components/button/buttonsecondary";
import BookingForm from "@/components/input/use_index";

import { Footer } from "@/components/footer";


export default function Home() {
  return ( 
    <div>
    <div className="flex gap-3 flrx-col">
      <BookingForm />
    </div>
   < ButtonGhost disabled={true}  onClick={async () => {
  await new Promise(res => setTimeout(res, 2000)); // โหลด 2 วินาที
}}>
  Submit
</ ButtonGhost>
  
    <div>
      <Footer />
    </div>
    </div>
  );
}

