import { Card, CardContent } from "../ui/card";

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
}

export function ListingsCard({
    id,
    price,
    address,
    city,
    beds,
    baths,
    sqft,
    imageUrl,
    timeAgo
}: ListingsCardProps) {
    return (
        <Card key={id} className="w-[200px] h-[240px] sm:w-[220px] sm:h-[270px] lg:w-[250px] lg:h-[300px] overflow-hidden hover:shadow-md transition-all cursor-pointer group">
            {/* Image Container */}
            <div className="relative w-full h-[130px] sm:h-[145px] lg:h-[160px] bg-gray-100">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={`${address}, ${city}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No Image Available
                    </div>
                )}
                
                {/* Floating Badges */}
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1.5 z-10">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-[10px] text-white font-semibold tracking-wide uppercase">{timeAgo}</span>
                </div>
            </div>

            {/* Content Area */}
            <CardContent className="p-4">
                <div className="mb-3">
                    <div className="text-xl font-bold text-gray-900 tracking-tight">
                        ${price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 truncate mt-0.5">
                        {address}, {city}
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-sm text-gray-700">
                    <span className="flex items-center gap-1">
                        <strong className="text-gray-900">{beds}</strong> bds
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-1">
                        <strong className="text-gray-900">{baths}</strong> ba
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-1">
                        <strong className="text-gray-900">{sqft}</strong> sqft
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}