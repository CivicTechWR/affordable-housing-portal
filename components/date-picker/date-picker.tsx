import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Calendar01FreeIcons } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from "@hugeicons/react";

export interface DatePickerProps {
  selected?: Date;
  onSelect: (date?: Date) => void;
  formattedText: string;
}

export function DatePicker({ selected, onSelect, formattedText }: DatePickerProps) {
  return (
    <>
            <h4 className="font-medium leading-none">Move-In Date</h4>

    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <HugeiconsIcon icon={Calendar01FreeIcons} strokeWidth={2} />
          <span>{formattedText}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar 
          mode="single" 
          selected={selected} 
          onSelect={onSelect} 
        />
      </PopoverContent>
    </Popover>
    </>
  );
}