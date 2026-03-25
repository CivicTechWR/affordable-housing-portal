import { Prisma } from '@prisma/client';
import { randomInt } from 'node:crypto';

export const addressFactory =
  (): Prisma.AddressCreateWithoutBuildingAddressInput =>
    [
      banffAddress,
      whistlerAddress,
      ottawaAddress,
      halifaxAddress,
      charlottetownAddress,
      niagaraAddress,
      jasperAddress,
      quebecCityAddress,
    ][randomInt(8)];

export const banffAddress = {
  placeName: 'Banff National Park',
  city: 'Banff',
  county: 'Division No. 15',
  state: 'AB',
  street: '224 Banff Ave',
  zipCode: 'T1L 1K2',
  latitude: 51.1784,
  longitude: -115.5708,
};

export const whistlerAddress = {
  placeName: 'Whistler Village',
  city: 'Whistler',
  county: 'Squamish-Lillooet',
  state: 'BC',
  street: '4293 Mountain Square',
  zipCode: 'V8E 1B8',
  latitude: 50.1163,
  longitude: -122.9574,
};

export const ottawaAddress = {
  placeName: 'Parliament Hill',
  city: 'Ottawa',
  county: 'Ottawa',
  state: 'ON',
  street: '1 Wellington St',
  zipCode: 'K1A 0A9',
  latitude: 45.4236,
  longitude: -75.7009,
};

export const halifaxAddress = {
  placeName: 'Halifax Waterfront',
  city: 'Halifax',
  county: 'Halifax',
  state: 'NS',
  street: '1675 Lower Water St',
  zipCode: 'B3J 1S3',
  latitude: 44.6488,
  longitude: -63.5752,
};

export const charlottetownAddress = {
  placeName: 'Province House',
  city: 'Charlottetown',
  county: 'Queens',
  state: 'PE',
  street: '165 Richmond St',
  zipCode: 'C1A 1J1',
  latitude: 46.2352,
  longitude: -63.1264,
};

export const niagaraAddress = {
  placeName: 'Niagara Falls',
  city: 'Niagara Falls',
  county: 'Niagara',
  state: 'ON',
  street: '6650 Niagara Pkwy',
  zipCode: 'L2E 6X8',
  latitude: 43.0896,
  longitude: -79.0849,
};

export const jasperAddress = {
  placeName: 'Jasper National Park',
  city: 'Jasper',
  county: 'Division No. 13',
  state: 'AB',
  street: '500 Connaught Dr',
  zipCode: 'T0E 1E0',
  latitude: 52.8737,
  longitude: -117.8054,
};

export const quebecCityAddress = {
  placeName: 'Old Quebec',
  city: 'Quebec City',
  county: 'Capitale-Nationale',
  state: 'QC',
  street: '1 Rue des Carrières',
  zipCode: 'G1R 4P5',
  latitude: 46.8119,
  longitude: -71.2057,
};
