import generalTranslations from "@bloom-housing/shared-helpers/src/locales/general.json"
import frenchTranslations from "@bloom-housing/shared-helpers/src/locales/fr.json"

import additionalGeneralTranslations from "../../page_content/locale_overrides/general.json"

export const translations = {
  general: generalTranslations,
  fr: frenchTranslations,
} as Record<string, any>

export const overrideTranslations = { en: additionalGeneralTranslations } as Record<string, any>
