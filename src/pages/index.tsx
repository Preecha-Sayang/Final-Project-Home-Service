import DropdownAdmin from "@/components/dropdown/DropdownAdmin";
import DropdownUser from "@/components/dropdown/DropdownUser";



export default function Home() {
  return (
    <div className="p-6 flex flex-col gap-10 bg-gray-100 min-h-screen">
      <DropdownUser />
      <DropdownAdmin />
    </div>)
}

