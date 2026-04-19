import { ReactNode } from "react";

interface ListingsPanelShellProps {
  grow?: boolean;
  header: ReactNode;
  children: ReactNode;
}

export function ListingsPanelShell({ grow, header, children }: ListingsPanelShellProps) {
  return (
    <div
      className={`flex flex-col h-full bg-background min-w-[300px] sm:min-w-[330px] lg:min-w-[360px] ${
        grow ? "flex-1" : ""
      }`}
    >
      {header}
      {children}
    </div>
  );
}
