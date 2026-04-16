import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";

interface ListingsCardProps {
  id: string;
  price: number;
  address: string;
  city: string;
  beds: number;
  baths: number;
  sqft: number;
  imageUrl?: string;
  timeAgo: string;
  variant?: "vertical" | "horizontal";
}

const variants = {
  vertical: {
    card: "w-[260px] h-[300px] sm:w-[290px] sm:h-[330px] lg:w-[320px] lg:h-[360px]",
    image: "w-full h-[160px] sm:h-[175px] lg:h-[190px]",
    content: "p-4",
    price: "text-xl",
    address: "text-sm",
    stats: "text-sm gap-x-3",
    statGap: "gap-1",
    badge: "top-2 left-2 px-2 py-1 gap-1.5",
    badgeDot: "w-2 h-2",
    badgeText: "text-[10px]",
    noImageText: "text-sm",
  },
  horizontal: {
    card: "w-full h-[120px] sm:h-[140px] flex flex-row",
    image: "w-[100px] sm:w-[120px] shrink-0",
    content: "p-3 flex-1 min-w-0 flex flex-col justify-center",
    price: "text-base",
    address: "text-xs",
    stats: "text-xs gap-x-2",
    statGap: "gap-0.5",
    badge: "top-1.5 left-1.5 px-1.5 py-0.5 gap-1",
    badgeDot: "w-1.5 h-1.5",
    badgeText: "text-[8px]",
    noImageText: "text-xs",
  },
};

export function ListingsCard({
  id,
  price,
  address,
  city,
  beds,
  baths,
  sqft,
  imageUrl,
  timeAgo,
  variant = "vertical",
}: ListingsCardProps) {
  const v = variants[variant];
  const isHorizontal = variant === "horizontal";

  return (
    <Link key={id} href={`/listings/${id}`} className="block">
      <Card
        key={id}
        className={`${v.card} overflow-hidden hover:shadow-md transition-all cursor-pointer group`}
      >
        <div className={`relative ${v.image} bg-muted`}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${address}, ${city}`}
              fill
              sizes="(max-width: 640px) 260px, (max-width: 1024px) 290px, 320px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center text-muted-foreground ${v.noImageText}`}
            >
              {isHorizontal ? "No Image" : "No Image Available"}
            </div>
          )}
          <div
            className={`absolute ${v.badge} bg-black/70 backdrop-blur-sm rounded flex items-center z-10`}
          >
            <div className={`${v.badgeDot} rounded-full bg-primary`} />
            <span className={`${v.badgeText} text-white font-semibold tracking-wide uppercase`}>
              {timeAgo}
            </span>
          </div>
        </div>

        <CardContent className={v.content}>
          <div className={isHorizontal ? "mb-1" : "mb-3"}>
            <div className={`${v.price} font-bold text-foreground tracking-tight`}>
              ${price.toLocaleString()}
            </div>
            <div
              className={`${v.address} text-muted-foreground truncate ${isHorizontal ? "" : "mt-0.5"}`}
            >
              {address}, {city}
            </div>
          </div>

          <div className={`flex items-center ${v.stats} flex-wrap text-muted-foreground`}>
            <span className={`flex items-center ${v.statGap}`}>
              <strong className="text-foreground">{beds}</strong> bds
            </span>
            <span className="text-border">|</span>
            <span className={`flex items-center ${v.statGap}`}>
              <strong className="text-foreground">{baths}</strong> ba
            </span>
            <span className="text-border">|</span>
            <span className={`flex items-center ${v.statGap}`}>
              <strong className="text-foreground">{sqft}</strong> sqft
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
