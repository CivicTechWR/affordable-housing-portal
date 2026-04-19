import { Skeleton } from "@/components/ui/skeleton";
import { ListingsShell } from "@/components/listings-layout/ListingsShell";
import { ListingsPanelShell } from "@/components/listings-layout/ListingsPanelShell";
import { FULLSCREEN_CARD_GRID_CLASS } from "@/components/listing-card-list/listingsCardList";

function ListingsHeaderSkeleton() {
  return (
    <>
      <div className="flex flex-row items-center w-full gap-6">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
        <div className="w-full max-w-[280px] shrink-0">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="hidden lg:flex items-center gap-6 shrink-0">
          <Skeleton className="h-9 w-[180px] rounded-md" />
          <Skeleton className="h-9 w-[180px] rounded-md" />
        </div>
        <div>
          <Skeleton className="h-9 w-[100px] rounded-full" />
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2 shrink-0">
        <Skeleton className="h-9 w-[110px] rounded-full" />
      </div>
    </>
  );
}

function ListingsPanelHeaderSkeleton() {
  return (
    <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center gap-3">
      <Skeleton className="h-4 w-[90px]" />
      <Skeleton className="h-9 w-[180px]" />
      <div className="ml-auto">
        <Skeleton className="h-9 w-[110px] rounded-full" />
      </div>
    </div>
  );
}

export default function ListingsSkeleton() {
  return (
    <ListingsShell
      header={<ListingsHeaderSkeleton />}
      panel={
        <ListingsPanelShell grow header={<ListingsPanelHeaderSkeleton />}>
          <div className="flex-1 overflow-auto p-4">
            <div className={`grid gap-4 ${FULLSCREEN_CARD_GRID_CLASS}`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[260px] sm:w-[290px] lg:w-[320px] h-[300px] sm:h-[330px] lg:h-[360px] rounded-lg border overflow-hidden"
                >
                  <Skeleton className="w-full h-[160px] sm:h-[175px] lg:h-[190px]" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-6 w-[80px]" />
                    <Skeleton className="h-4 w-[140px]" />
                    <div className="flex gap-3">
                      <Skeleton className="h-4 w-[40px]" />
                      <Skeleton className="h-4 w-[40px]" />
                      <Skeleton className="h-4 w-[50px]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ListingsPanelShell>
      }
    />
  );
}
