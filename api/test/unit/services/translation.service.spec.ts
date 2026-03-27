import { LanguagesEnum } from '@prisma/client';
import { randomUUID } from 'crypto';
import { TranslationService } from '../../../src/services/translation.service';
import { PrismaService } from '../../../src/services/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('Testing translations service', () => {
  let service: TranslationService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TranslationService, PrismaService],
    }).compile();

    service = module.get<TranslationService>(TranslationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('Should get unique translations by language and jurisdiction', async () => {
    const jurisdictionId = randomUUID();
    const translations = {
      id: 'translations id 1',
      createdAt: new Date(),
      updatedAt: new Date(),
      language: LanguagesEnum.en,
      jurisdictionId: jurisdictionId,
      translations: {
        translation1: 'translation 1',
        translation2: 'translation 2',
      },
    };
    prisma.translations.findFirst = jest
      .fn()
      .mockResolvedValueOnce(translations);

    const result = await service.getTranslationByLanguageAndJurisdiction(
      LanguagesEnum.es,
      jurisdictionId,
    );

    expect(result).toEqual(translations);
    expect(prisma.translations.findFirst).toHaveBeenCalledTimes(1);
  });

  it('Should get merged translations for just english and null jurisdiction', async () => {
    const nullJurisdiction = {
      value: 'null jurisdiction',
      extraValue: 'extra value',
    };
    prisma.translations.findFirst = jest
      .fn()
      .mockResolvedValueOnce({ translations: nullJurisdiction });
    const result = await service.getMergedTranslations(null);
    expect(prisma.translations.findFirst).toBeCalledTimes(1);
    expect(result).toEqual(nullJurisdiction);
  });

  it('Should get merged translations for jurisdiction in english', async () => {
    const nullJurisdiction = {
      value: 'null jurisdiction',
      extraValue: 'extra value',
    };
    const englishJurisdictionValue = {
      value: 'jurisdiction english',
    };
    prisma.translations.findFirst = jest
      .fn()
      .mockResolvedValueOnce({ translations: englishJurisdictionValue })
      .mockResolvedValueOnce({ translations: nullJurisdiction });
    const result = await service.getMergedTranslations(randomUUID());
    expect(prisma.translations.findFirst).toBeCalledTimes(2);
    expect(result).toEqual({
      value: 'jurisdiction english',
      extraValue: 'extra value',
    });
  });
  it('Should get merged translations for just non-english and active jurisdiction', async () => {
    const nullJurisdiction = {
      value: 'null jurisdiction',
      extraValue: 'extra value',
    };
    const englishJurisdictionValue = {
      value: 'jurisdiction english',
    };
    const spanishJurisdictionValue = {
      value: 'jurisdiction spanish',
    };
    const spanishNullValue = {
      value: 'null jurisdiction',
      extraValue: 'extra spanish',
    };
    prisma.translations.findFirst = jest
      .fn()
      .mockResolvedValueOnce({ translations: spanishJurisdictionValue })
      .mockResolvedValueOnce({ translations: spanishNullValue })
      .mockResolvedValueOnce({ translations: englishJurisdictionValue })
      .mockResolvedValueOnce({ translations: nullJurisdiction });
    const result = await service.getMergedTranslations(
      randomUUID(),
      LanguagesEnum.es,
    );
    expect(prisma.translations.findFirst).toBeCalledTimes(4);
    expect(result).toEqual({
      value: 'jurisdiction spanish',
      extraValue: 'extra spanish',
    });
  });
});
