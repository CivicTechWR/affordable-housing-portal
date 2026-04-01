import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ComponentProps } from "react";
import { LabeledCheckbox } from "../labeled-checkbox/LabeledCheckbox";

export interface FilterOption {
  id: string;
  label: string;
  type: "boolean";
}

export interface DynamicFilterGroup {
  groupId: string;
  groupLabel: string;
  options: FilterOption[];
}

export interface FeatureAccordionProps {
  groups: DynamicFilterGroup[];
  getCheckboxProps: (id: string) => ComponentProps<typeof Checkbox>;
}

export function FeatureAccordion({ groups, getCheckboxProps }: FeatureAccordionProps) {
  if (!groups || groups.length === 0) return null;

  return (
    <Accordion type="multiple" className="max-w-lg">
      {groups.map((group) => (
        <AccordionItem key={group.groupId} value={group.groupId}>
          <AccordionTrigger className="text-md">{group.groupLabel}</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-4 pt-2">
              {/* --- THE CLEANED UP MAPPING --- */}
              {group.options.map((option) => (
                <LabeledCheckbox
                  key={option.id}
                  label={option.label}
                  {...getCheckboxProps(option.id)}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
