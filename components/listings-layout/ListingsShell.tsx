import { ReactNode } from "react";

interface ListingsShellProps {
  header: ReactNode;
  panel?: ReactNode;
  map?: ReactNode;
  filters?: ReactNode;
}

export function ListingsShell({ header, panel, map, filters }: ListingsShellProps) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex h-16 items-center border-b bg-background px-4 shrink-0">{header}</header>
      <main className="flex flex-1 overflow-hidden">
        {panel}
        {map}
        {filters}
      </main>
    </div>
  );
}
