import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type SortOptions = {
    value: string;
    label: string;
}
export function SortOptions({ sortOptions, onChange, value }: { sortOptions: SortOptions[], onChange: (value: string) => void, value?: string }) {
    return (
                <Select onValueChange={onChange} value={value}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {sortOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
    );
}
