import ButtonGhost from "@/components/button/buttonghost";


export default function Home() {
  return (
   < ButtonGhost disabled={true}  onClick={async () => {
  await new Promise(res => setTimeout(res, 2000)); // โหลด 2 วินาที
}}>
  Submit
</ ButtonGhost>
  )
}
