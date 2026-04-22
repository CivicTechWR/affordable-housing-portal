import { cn } from "@/lib/utils";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

export interface PriceRangeInputProps {
  min?: number;
  max?: number;
  step?: number;
  onMinChange: (min: number | undefined) => Promise<void>;
  onMaxChange: (max: number | undefined) => Promise<void>;
  className?: string;
  fieldClassName?: string;
  labelClassName?: string;
}

export function parsePriceInputValue(value: string) {
  if (value.trim().length === 0) {
    return undefined;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return undefined;
  }

  return parsedValue;
}

function normalizePriceInputValue(value: string) {
  if (value.trim().length === 0) {
    return "";
  }

  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue)) {
    return "";
  }

  return Math.max(0, parsedValue).toString();
}

export function PriceRangeInput({
  min,
  max,
  step,
  onMinChange,
  onMaxChange,
  className,
  fieldClassName,
  labelClassName,
}: PriceRangeInputProps) {
  const [minInputValue, setMinInputValue] = useState(min?.toString() ?? "");
  const [maxInputValue, setMaxInputValue] = useState(max?.toString() ?? "");

  useEffect(() => {
    setMinInputValue(min?.toString() ?? "");
  }, [min]);

  useEffect(() => {
    setMaxInputValue(max?.toString() ?? "");
  }, [max]);

  return (
    <FieldSet className={cn("flex-row", className)}>
      <Field className={fieldClassName}>
        <FieldLabel className={labelClassName}>Min Price</FieldLabel>
        <Input
          min={0}
          type="number"
          step={step}
          value={minInputValue}
          placeholder="Min"
          onChange={(e) => {
            const nextValue = normalizePriceInputValue(e.target.value);

            setMinInputValue(nextValue);
            void onMinChange(parsePriceInputValue(nextValue));
          }}
        />
      </Field>

      <Field className={fieldClassName}>
        <FieldLabel className={labelClassName}>Max Price</FieldLabel>

        <Input
          min={0}
          type="number"
          step={step}
          value={maxInputValue}
          placeholder="Max"
          onChange={(e) => {
            const nextValue = normalizePriceInputValue(e.target.value);

            setMaxInputValue(nextValue);
            void onMaxChange(parsePriceInputValue(nextValue));
          }}
        />
      </Field>
    </FieldSet>
  );
}
