import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractDTO } from '../shared/abstract.dto';
import { ValidationsGroupsEnum } from '../../enums/shared/validation-groups-enum';
import { FeatureFlagEnum } from '../../enums/feature-flags/feature-flags-enum';

export class FeatureFlag extends AbstractDTO {
  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(256, { groups: [ValidationsGroupsEnum.default] })
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @ApiProperty({
    enum: FeatureFlagEnum,
    enumName: 'FeatureFlagEnum',
    example: 'sampleFeatureFlag',
  })
  name: FeatureFlagEnum | string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @ApiProperty()
  description: string;

  @Expose()
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @ApiProperty()
  active: boolean;
}
