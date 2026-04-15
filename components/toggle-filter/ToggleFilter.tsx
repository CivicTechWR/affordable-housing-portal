import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Field, FieldLabel } from "@/components/ui/field";

export type ToggleFilterProps = {
  title: string;
  options: {
    value: string;
    label: string;
  }[];
  value: string | undefined;
  onValueChange: (value: string) => void;
  // ToDo: Add "selectedFilters" to show a badge of number of filters selected
};

export function ToggleFilter({ title, options, value, onValueChange }: ToggleFilterProps) {
  return (
    <Field>
      <FieldLabel className="font-medium leading-none">{title}</FieldLabel>
      <ToggleGroup
        type="single"
        value={value ?? ""}
        onValueChange={onValueChange}
        className="justify-start"
      >
        {options.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value} className="border">
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </Field>
  );
}
