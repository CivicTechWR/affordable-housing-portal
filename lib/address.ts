type AddressPart = string | null | undefined;

export interface BuildAddressOptions {
  unitNumber?: AddressPart;
  street1?: AddressPart;
  street2?: AddressPart;
  city?: AddressPart;
  postalCode?: AddressPart;
}

const normalize = (value: AddressPart) => value?.trim() ?? "";

export function buildAddress({ unitNumber, street1, street2 }: BuildAddressOptions): string {
  return [unitNumber ? `${normalize(unitNumber)} -` : "", normalize(street1), normalize(street2)]
    .filter(Boolean)
    .join(" ");
}
