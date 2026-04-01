import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// 1. Explicitly declare the exact props instead of importing the massive union type
export type ToggleFilterProps = {
  title: string;
  options?: string[];
  value?: string;
  onValueChange: (value: string) => void;
};

export function ToggleFilter({
  title,
  options = ["0", "1", "2", "3", "4+"],
  value,
  onValueChange,
}: ToggleFilterProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium leading-none">{title}</h3>

      <ToggleGroup
        type="single"
        value={value}
        onValueChange={onValueChange}
        className="justify-start"
      >
        {options.map((option) => (
          <ToggleGroupItem key={option} value={option} className="border">
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
