import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';

export type ToggleFilterProps = {
  title: string;
  options?: string[];
  value?: string;
  onValueChange: (value: string) => void;
  // ToDo: Add "selectedFilters" to show a badge of number of filters selected
};

export function ToggleFilter({
  title,
  options = ['0', '1', '2', '3', '4+'],
  value,
  onValueChange,
}: ToggleFilterProps) {
  return (
      
      <Field>
        <FieldLabel className="font-medium leading-none">{title}</FieldLabel>
        <ToggleGroup 
          type="single" 
          value={value} 
          onValueChange={(val) => {
            if (val) onValueChange(val);
          }} 
          className="justify-start"
        >
          {options.map((option) => (
            <ToggleGroupItem 
              key={option} 
              value={option} 
              className="border"
            >
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>
);
}