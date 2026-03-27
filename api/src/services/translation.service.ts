import { Injectable } from '@nestjs/common';
import { LanguagesEnum, Translations } from '@prisma/client';
import { PrismaService } from './prisma.service';
import * as lodash from 'lodash';

@Injectable()
export class TranslationService {
  constructor(private prisma: PrismaService) {}

  public async getMergedTranslations(
    jurisdictionId: string | null,
    language?: LanguagesEnum,
  ) {
    let jurisdictionalTranslations: Promise<Translations | null>,
      genericTranslations: Promise<Translations | null>,
      jurisdictionalDefaultTranslations: Promise<Translations | null>;

    if (language && language !== LanguagesEnum.en) {
      if (jurisdictionId) {
        jurisdictionalTranslations =
          this.getTranslationByLanguageAndJurisdiction(
            language,
            jurisdictionId,
          );
      }
      genericTranslations = this.getTranslationByLanguageAndJurisdiction(
        language,
        null,
      );
    }

    if (jurisdictionId) {
      jurisdictionalDefaultTranslations =
        this.getTranslationByLanguageAndJurisdiction(
          LanguagesEnum.en,
          jurisdictionId,
        );
    }

    const genericDefaultTranslations =
      this.getTranslationByLanguageAndJurisdiction(LanguagesEnum.en, null);

    const [genericDefault, generic, jurisdictionalDefault, jurisdictional] =
      await Promise.all([
        genericDefaultTranslations,
        genericTranslations,
        jurisdictionalDefaultTranslations,
        jurisdictionalTranslations,
      ]);

    // Deep merge
    const translations = lodash.merge(
      genericDefault?.translations,
      generic?.translations,
      jurisdictionalDefault?.translations,
      jurisdictional?.translations,
    );

    return translations;
  }

  public async getTranslationByLanguageAndJurisdiction(
    language: LanguagesEnum,
    jurisdictionId: string | null,
  ): Promise<Translations | null> {
    return await this.prisma.translations.findFirst({
      where: { AND: [{ language: language }, { jurisdictionId }] },
    });
  }
}
