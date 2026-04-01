"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ToggleIconButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  // We pass the icon component itself, not an element, so we can inject classes into it
  icon: React.ReactElement;
  isActive: boolean;
  activeClassName?: string;
}

export function ToggleIconButton({
  icon,
  isActive,
  activeClassName = "text-green-600", // Default to your brand color
  className,
  ...props
}: ToggleIconButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "rounded-full bg-white transition-colors duration-300 hover:bg-gray-50",
        isActive && "border-green-200 bg-green-50 hover:bg-green-100", // Optional: tint the button background
        isActive && activeClassName,
        className,
      )}
      {...props}
    >
      {icon}
    </Button>
  );
}
