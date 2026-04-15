import { Skeleton } from "@/components/ui/skeleton";

export default function ListingsSkeleton() {
  return (
    <>
      <header className="flex h-16 items-center border-b bg-background px-4 shrink-0">
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
      </header>
      <main className="flex flex-1 overflow-hidden">
        <div className="flex flex-col h-full bg-background min-w-[300px] sm:min-w-[330px] lg:min-w-[360px] flex-1">
          <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center gap-3">
            <Skeleton className="h-4 w-[90px]" />
            <Skeleton className="h-9 w-[180px]" />
            <div className="ml-auto">
              <Skeleton className="h-9 w-[110px] rounded-full" />
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="grid gap-4 grid-cols-[260px] sm:grid-cols-[290px_290px] lg:grid-cols-[320px_320px_320px]">
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
        </div>
      </main>
    </>
  );
}
