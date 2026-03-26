import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDefined, IsString, ValidateNested } from 'class-validator';
import { CustomListingFeature } from './custom-listing-feature.dto';

export class CustomListingFeatureCategory {
  @Expose()
  @IsDefined({ always: true })
  @IsString({ always: true })
  @ApiProperty()
  name: string;

  @Expose()
  @IsDefined({ always: true })
  @ValidateNested({ each: true, always: true })
  @Type(() => CustomListingFeature)
  @ApiProperty({ type: [CustomListingFeature] })
  features: CustomListingFeature[];
}
