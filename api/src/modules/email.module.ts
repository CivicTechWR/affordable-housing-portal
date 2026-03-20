import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../services/email.service';
import { JurisdictionService } from '../services/jurisdiction.service';
import { TranslationService } from '../services/translation.service';
import { GoogleTranslateService } from '../services/google-translate.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    EmailService,
    JurisdictionService,
    TranslationService,
    ConfigService,
    GoogleTranslateService,
    Logger,
  ],
  exports: [EmailService],
})
export class EmailModule {}
