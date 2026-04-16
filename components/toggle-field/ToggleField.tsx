import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Field, FieldLabel } from "@/components/ui/field";

export type ToggleFieldProps = {
  title?: string;
  description?: string;
  options: {
    value: string;
    label: string;
  }[];
  value: string | undefined | null;
  onValueChange: (value: string) => void;
  allowEmpty?: boolean;
};

export function ToggleField({
  title,
  description,
  options,
  value,
  onValueChange,
  allowEmpty,
}: ToggleFieldProps) {
  return (
    <Field>
      {title && (
        <div className="grid gap-1.5 leading-none mb-1">
          <FieldLabel className="font-medium leading-none">{title}</FieldLabel>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <ToggleGroup
        type="single"
        value={value ?? ""}
        onValueChange={(val) => {
          if (val) {
            onValueChange(val);
          } else if (allowEmpty) {
            onValueChange("");
          }
        }}
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
