type AddressPart = string | null | undefined;

export interface BuildAddressOptions {
  unitNumber?: AddressPart;
  street1?: AddressPart;
  street2?: AddressPart;
  city?: AddressPart;
  postalCode?: AddressPart;
}

const normalize = (value: AddressPart) => value?.trim() ?? "";

function compactAddressParts(parts: AddressPart[]): string[] {
  return parts.map(normalize).filter((part) => part.length > 0);
}

export function buildAddress({
  unitNumber,
  street1,
  street2,
  city,
  postalCode,
}: BuildAddressOptions): string {
  const normalizedUnit = normalize(unitNumber);
  const streetSegment = compactAddressParts([street1, street2]).join(" ");

  const lineOne =
    normalizedUnit && streetSegment
      ? `${normalizedUnit} - ${streetSegment}`
      : normalizedUnit || streetSegment;

  const lineTwo = compactAddressParts([city, postalCode]).join(" ");

  return [lineOne, lineTwo].filter(Boolean).join(", ");
}
