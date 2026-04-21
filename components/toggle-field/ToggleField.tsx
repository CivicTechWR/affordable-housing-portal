import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Field, FieldLabel } from "@/components/ui/field";
import { ComponentProps } from "react";

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
  variant?: ComponentProps<typeof ToggleGroup>["variant"];
};

export function ToggleField({
  title,
  description,
  options,
  value,
  onValueChange,
  allowEmpty,
  variant,
}: ToggleFieldProps) {
  return (
    <Field>
      {title && (
        <div className="grid gap-1.5 leading-none mb-1">
          <FieldLabel className="font-medium leading-none">{title}</FieldLabel>
          {description && (
            <p className="text-sm text-muted-foreground whitespace-pre-line">{description}</p>
          )}
        </div>
      )}
      <ToggleGroup
        type="single"
        variant={variant}
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
