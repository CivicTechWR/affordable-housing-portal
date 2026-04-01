"use client";

import { Button } from "@/components/ui/button";
import { Minus, Mouse, Plus } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function MapView({ listings }: { listings: any[] }) {
  return (
    <div className="relative w-full h-full bg-[#e5e3df] overflow-hidden">
      {/* Actual Map Engine would go here (Mapbox/Google) */}
      <div className="absolute inset-0 opacity-40 bg-[url('https://www.google.com/maps/vt/pb=!1m4...')] bg-cover" />

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
      {listings.slice(0, 8).map((l, i) => (
        <div
          key={i}
          className="absolute bg-[#3b444b] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border border-white cursor-pointer hover:scale-110 transition-transform"
          style={{ top: `${20 + i * 10}%`, left: `${30 + i * 5}%` }}
        >
          {Math.floor(Math.random() * 100)}
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
