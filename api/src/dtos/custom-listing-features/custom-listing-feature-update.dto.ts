import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsUUID } from 'class-validator';
import { CustomListingFeature } from './custom-listing-feature.dto';

export class CustomListingFeatureUpdate extends OmitType(CustomListingFeature, [
  'createdAt',
  'id',
  'updatedAt',
]) {
  @Expose()
  @IsString({ always: true })
  @IsUUID(4, { always: true })
  @ApiPropertyOptional()
  id?: string;
}
