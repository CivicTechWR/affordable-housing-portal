import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { UserUpdate } from './user-update.dto';

import { EnforceLowerCase } from '../../decorators/enforce-lower-case.decorator';
import { ValidationsGroupsEnum } from '../../enums/shared/validation-groups-enum';
import { passwordRegex } from '../../utilities/password-regex';
import { Match } from '../../decorators/match-decorator';

export class UserCreate extends OmitType(UserUpdate, [
  'id',
  'userRoles',
  'password',
  'currentPassword',
  'email',
]) {
  @Expose()
  @ApiProperty()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @Matches(passwordRegex, {
    message: 'passwordTooWeak',
    groups: [ValidationsGroupsEnum.default],
  })
  password: string;

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(64, { groups: [ValidationsGroupsEnum.default] })
  @Match('password', { groups: [ValidationsGroupsEnum.default] })
  @ApiProperty()
  passwordConfirmation: string;

  @Expose()
  @ApiProperty()
  @IsEmail({}, { groups: [ValidationsGroupsEnum.default] })
  @EnforceLowerCase()
  email: string;

  @Expose()
  @ApiPropertyOptional()
  @IsEmail({}, { groups: [ValidationsGroupsEnum.default] })
  @Match('email', { groups: [ValidationsGroupsEnum.default] })
  @EnforceLowerCase()
  emailConfirmation?: string;
}
