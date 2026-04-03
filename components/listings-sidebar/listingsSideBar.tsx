import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
// Assuming these are used elsewhere or you plan to use them, keeping the imports intact
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { SortOptions } from "../sort-options/SortOptions";

export interface Listing {
    id: string;
    price: number;
    address: string;
    city: string;
    beds: string | number;
    baths: number;
    sqft: number;
    imageUrl?: string;
    timeAgo: string;
}

export enum ListingsDisplayMode {
    SIDESCROLL = 'sidescroll',
    FULLSCREEN = 'fullscreen',
}
interface ListingsSidebarProps {
    listings: Listing[];
    mode: ListingsDisplayMode;
}

export function ListingsSidebar({ listings, mode}: ListingsSidebarProps) {
    const isFullscreen = mode === ListingsDisplayMode.FULLSCREEN;

    return (
        <ScrollArea className={isFullscreen ? "w-full h-full" : "flex-1"}>
            <div 
                className={`p-4 ${
                    isFullscreen 
                        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" 
                        : "space-y-4"
                }`}
            >
                {listings.map((listing) => (
                    <Card key={listing.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col">
                        <div className="relative aspect-[16/9] bg-gray-200">
                            {listing.imageUrl && (
                                <img
                                    src={listing.imageUrl}
                                    alt={`${listing.address}, ${listing.city}`}
                                    className="object-cover w-full h-full"
                                />
                            )}  
                            {/* Image Placeholder */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            {/* descope favouriting for now
                            <ToggleIconButton 
                                icon={<HugeiconsIcon icon={Heart} strokeWidth={2} />}
                                isActive={false} 
                                activeClassName="text-green-600" 
                                className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                            /> */}
                            <div className="absolute bottom-2 left-2 flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500 border border-white" />
                                <span className="text-[10px] text-white font-medium">{listing.timeAgo}</span>
                            </div>
                        </div>

                        <CardContent className="p-3 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    ${listing.price.toLocaleString()}
                                </div>
                                <div className="text-sm font-semibold uppercase truncate">
                                    {listing.address}, {listing.city}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                    <strong>{listing.beds}</strong> bed
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <strong>{listing.baths}</strong> bath
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <strong>{listing.sqft}</strong> sqft
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </ScrollArea>
    );
}