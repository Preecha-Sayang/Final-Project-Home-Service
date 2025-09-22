import ButtonGhost from "../button/buttonghost";
import Image from 'next/image';


interface ServiceCardProps {
  imgSrc: string;
  category: string;
  title: string;
  price: string;
  onAction?: () => Promise<void> | void;
  onMoreInfo?: () => Promise<void> | void;
}


function ServiceCard({ imgSrc, category, title, price, onAction, onMoreInfo }: ServiceCardProps) {
  return (
    <div className="w-full max-w-[349px] md:w-[349px] rounded-lg overflow-hidden bg-white border border-gray-300 transition-all duration-300 hover:shadow-[2px_2px_24px_0px_rgba(23,51,106,0.12)] cursor-pointer">
      {/* Image placeholder - 60% of card height */}
      <div className="h-48 md:h-[240px] w-full bg-blue-100 flex items-center justify-center rounded-t-lg">
        <Image
          src={imgSrc}
          alt={title}
          width={349}
          height={400}
          className="h-full w-full object-cover"
        />
      </div>


      {/* Content area - 40% of card height */}
      <div className="p-4 flex flex-col justify-between gap-3">
        <div className="flex flex-col gap-2">
         
          {/* Category Tag */}
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-md w-fit">
            {category}
          </span>


          {/* Title */}
          <h3 className="font-bold text-lg text-gray-950 leading-tight">{title}</h3>


          {/* Price */}
          <div className="flex items-center gap-2 text-gray-500">
          <Image src="/images/icon_tag.svg" alt="PriceTag" width={20} height={20} />
            <span className="text-sm">{price}</span>
          </div>
        </div>


        {/* button */}
        <div className="flex justify-between mt-2 gap-2">
          <ButtonGhost onClick={onMoreInfo}>
            More information
          </ButtonGhost>
         
          <ButtonGhost onClick={onAction}>
            Call to Action
          </ButtonGhost>
</div>
      </div>
    </div>
  );
}


export default ServiceCard;