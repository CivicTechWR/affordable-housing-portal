import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRightIcon } from "@hugeicons/core-free-icons";
// If you defined this interface in your hook file, you can import it.
// Otherwise, here is the exact shape it expects:
export interface PriceRangeInputProps {
  min?: number;
  max?: number;
  step?: number;
  onValueChange: (min: number, max: number) => Promise<void>;
}

export function PriceRangeInput({ min = 0, max = 5000, onValueChange }: PriceRangeInputProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium leading-none">Rent Price</h3>

      {/* Use the value prop to drive the UI text */}
      <div className="flex justify-between text-sm text-muted-foreground">
        <Input
          type="number"
          value={min}
          placeholder="Min"
          onChange={(e) => onValueChange(parseInt(e.target.value) || 0, max)}
        />
        <HugeiconsIcon icon={ArrowRightIcon} strokeWidth={2} className="text-muted-foreground" />
        <Input
          type="number"
          value={max}
          placeholder="Max"
          onChange={(e) => onValueChange(min, parseInt(e.target.value) || 0)}
        />
      </div>
    </div>
  );
}
