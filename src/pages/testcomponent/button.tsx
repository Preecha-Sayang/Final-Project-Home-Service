import ButtonGhost from "@/components/button/buttonghost";
import ButtonLarge from "@/components/button/buttonlarge";
import ButtonPrimary from "@/components/button/buttonprimary";
import ButtonSecondaryLarge from "@/components/button/buttonseclarge";
import ButtonSecondary from "@/components/button/buttonsecondary";
import IconBell from "@/components/button/iconbell";

function ButtonPage() {
  return (
    <div className="  gap-[20px] flex flex-col items-center justify-center min-h-screen">
        <div id="ButtonSecondaryLarge" className="flex flex-col gap-[20px] ">
        <ButtonSecondaryLarge>
            ButtonSecondaryLarge
        </ButtonSecondaryLarge>

         <ButtonSecondaryLarge disabled={true} >
            ButtonSecondaryLarge
        </ButtonSecondaryLarge>

         <ButtonSecondaryLarge onClick={async () => {await new Promise(res => setTimeout(res, 2000))}}>
            ButtonSecondaryLarge
        </ButtonSecondaryLarge>
        </div>


        <div id="ButtonSecondary" className="flex flex-col gap-[20px]" >
        <ButtonSecondary>
            ButtonSecondary
        </ButtonSecondary>

        <ButtonSecondary disabled={true}>
            ButtonSecondary
        </ButtonSecondary>

        <ButtonSecondary onClick={async () => {await new Promise(res => setTimeout(res, 2000))}}>
            ButtonSecondary
        </ButtonSecondary>
        </div>

        <div id="ButtonPrimary" className="flex flex-col gap-[20px]">
        <ButtonPrimary>
          ButtonPrimary
        </ButtonPrimary>

        <ButtonPrimary disabled={true}>
           ButtonPrimary
        </ButtonPrimary>

        <ButtonPrimary onClick={async () => {await new Promise(res => setTimeout(res, 2000))}}>
           ButtonPrimary 
        </ButtonPrimary>
        </div>

        <div id="ButtonLarge" className="flex flex-col gap-[20px]">
        <ButtonLarge>
            ButtonLarge
        </ButtonLarge>


        <ButtonLarge disabled={true}>
            ButtonLarge
        </ButtonLarge>

        <ButtonLarge onClick={async () => {await new Promise(res => setTimeout(res, 2000))}}>
            ButtonLarge
        </ButtonLarge>
        </div>

        <div id="ButtonGhost" className="flex flex-col gap-[20px]">
        <ButtonGhost>
            ButtonGhost
        </ButtonGhost>

        <ButtonGhost disabled={true}>
            ButtonGhost
        </ButtonGhost>

        <ButtonGhost onClick={async () => {await new Promise(res => setTimeout(res, 2000))}}>
            ButtonGhost
        </ButtonGhost>

        <div id="IconBell" className="flex flex-col gap-[20px]">
            <IconBell/>
        </div>
        </div>
    </div>
  );
}

export default ButtonPage;