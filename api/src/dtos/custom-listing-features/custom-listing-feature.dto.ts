import { AbstractDTO } from '../shared/abstract.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { CustomListingScope } from '@prisma/client'
import { IsDefined, IsEnum, IsString, MaxLength } from 'class-validator';

export class CustomListingFeature extends AbstractDTO {
  @Expose()
  @IsDefined({ always: true })
  @IsString({ always: true })
  @MaxLength(256, { always: true })
  @ApiProperty()
  displayName: string;

  @Expose()
  @IsDefined({ always: true })
  @IsString({ always: true })
  @MaxLength(256, { always: true })
  @ApiProperty()
  key: string;

  @Expose()
  @IsDefined({ always: true })
  @IsString({ always: true })
  @MaxLength(256, { always: true })
  @ApiProperty()
  category: string;

  @Expose()
  @IsDefined({ always: true })
  @IsEnum(CustomListingScope, { always: true })
  @ApiProperty({
    enum: CustomListingScope,
    enumName: 'CustomListingScope',
  })
  scope: CustomListingScope;
}
