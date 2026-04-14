import {
    Field,
    FieldLabel,
    FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export interface PriceRangeInputProps {
    min?: number;
    max?: number;
    step?: number;
    onMinChange: (min: number | undefined) => Promise<void>;
    onMaxChange: (max: number | undefined) => Promise<void>;
}

export function PriceRangeInput({
    min,
    max,
    onMinChange,
    onMaxChange,
}: PriceRangeInputProps) {
    return (


        <FieldSet className="flex-row">

            <Field>
                <FieldLabel>Min Price</FieldLabel>
                <Input
                    type="number"
                    value={min}
                    placeholder="Min"
                    onChange={(e) => {
                        const val = e.target.value ? parseInt(e.target.value) : undefined;
                        onMinChange(val);
                    }}
                />
            </Field>

            <Field>
                <FieldLabel>Max Price</FieldLabel>

                <Input
                    type="number"
                    value={max}
                    placeholder="Max"
                    onChange={(e) => {
                        const val = e.target.value ? parseInt(e.target.value) : undefined;
                        onMaxChange(val);
                    }}
                />
            </Field>
        </FieldSet>
    );
}