import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../services/email.service';
import { JurisdictionService } from '../services/jurisdiction.service';
import { TranslationService } from '../services/translation.service';
import { GoogleTranslateService } from '../services/google-translate.service';
import { ResendService } from '../services/resend.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    EmailService,
    JurisdictionService,
    TranslationService,
    ConfigService,
    GoogleTranslateService,
    ResendService,
    Logger,
  ],
  exports: [EmailService],
})
export class EmailModule {}
