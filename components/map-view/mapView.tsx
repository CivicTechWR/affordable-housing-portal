"use client";

import { Button } from "@/components/ui/button";
import { Minus, Mouse, Plus } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function MapView({ listings }: { listings: any[] }) {
  const pinPositions = [
    { top: "18%", left: "22%" },
    { top: "28%", left: "56%" },
    { top: "42%", left: "35%" },
    { top: "52%", left: "68%" },
    { top: "62%", left: "44%" },
    { top: "72%", left: "24%" },
    { top: "38%", left: "78%" },
    { top: "20%", left: "70%" },
  ];

  return (
    <div className="relative w-full h-full bg-[#e5e3df] overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(255,255,255,0.45)_0,_rgba(255,255,255,0.45)_1px,_transparent_1px,_transparent_72px),linear-gradient(rgba(255,255,255,0.45)_0,_rgba(255,255,255,0.45)_1px,_transparent_1px,_transparent_72px)] bg-[length:72px_72px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(96,165,250,0.28),_transparent_26%),radial-gradient(circle_at_75%_35%,_rgba(52,211,153,0.2),_transparent_22%),radial-gradient(circle_at_40%_75%,_rgba(59,130,246,0.16),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.18),_rgba(15,23,42,0.08))]" />
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(135deg,transparent_0%,transparent_47%,rgba(148,163,184,0.35)_48%,transparent_49%,transparent_100%)] [background-size:180px_180px]" />

      {/* Floating Header Controls */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        <div className="flex bg-white rounded-md shadow-sm border overflow-hidden">
          <Button variant="ghost" className="rounded-none border-r px-4 h-9 bg-gray-50">
            Map
          </Button>
          <Button variant="ghost" className="rounded-none px-4 h-9">
            Satellite
          </Button>
        </div>
        <Button variant="outline" className="bg-white shadow-sm gap-2 h-9">
          <HugeiconsIcon icon={Mouse} /> Draw
        </Button>
      </div>

      {/* Pins Mockup */}
      {listings.slice(0, 8).map((listing, index) => (
        <div
          key={listing.id ?? index}
          className="absolute bg-[#3b444b] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border border-white cursor-pointer hover:scale-110 transition-transform"
          style={pinPositions[index % pinPositions.length]}
        >
          ${Math.round((listing.price ?? 0) / 100)}
        </div>
      ))}

      {/* Zoom Controls */}
      <div className="absolute bottom-8 right-4 flex flex-col gap-1 z-10">
        <Button
          size="icon"
          variant="outline"
          className="bg-white shadow-md rounded-b-none border-b-0 h-10 w-10"
        >
          <HugeiconsIcon icon={Plus} strokeWidth={2} />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="bg-white shadow-md rounded-t-none h-10 w-10"
        >
          <HugeiconsIcon icon={Minus} strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}
