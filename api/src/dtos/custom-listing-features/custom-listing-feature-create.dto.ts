import { OmitType } from '@nestjs/swagger';
import { CustomListingFeature } from './custom-listing-feature.dto';

export class CustomListingFeatureCreate extends OmitType(CustomListingFeature, [
  'createdAt',
  'id',
  'updatedAt',
]) {}
