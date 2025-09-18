import ButtonGhost from "@/components/button/buttonghost";
import ButtonLarge from "@/components/button/buttonlarge";
import ButtonPrimary from "@/components/button/buttonprimary";
import ButtonSecondaryLarge from "@/components/button/buttonseclarge";
import ButtonSecondary from "@/components/button/buttonsecondary";
import BookingForm from "@/components/input/use_index";
import Navbar from "@/components/navbar/Navbar";
import DropdownAdmin from "@/components/dropdown/DropdownAdmin";
import DropdownUser from "@/components/dropdown/DropdownUser";

export default function Home() {
  return (
    <div className="p-6 flex flex-col gap-10 bg-gray-100 min-h-screen">
      <DropdownUser />
      <DropdownAdmin />
      <Navbar />

      
    </div>)
}

