/* eslint-disable @typescript-eslint/no-var-requires */
// Prints keys that are in a foreign language translations file that do not exist in the english file for cleanup
// example: `ts-node unused-foreign-keys > unused-foreign-keys-output.json`
const englishTranslations = require("../locales/general.json")
const frenchTranslations = require("../locales/fr.json")

function main() {
  type TranslationsType = {
    [key: string]: string
  }

  const allTranslations = [{ translationKeys: frenchTranslations, language: "French" }]

  const getUnusedForeignKeys = (
    baseTranslations: TranslationsType,
    checkedTranslations: TranslationsType
  ) => {
    const baseTranslationsKeys = Object.keys(baseTranslations)
    const checkedTranslationsKeys = Object.keys(checkedTranslations)
    const unusedKeys: string[] = []
    checkedTranslationsKeys.forEach((key) => {
      if (!baseTranslationsKeys.find((item) => key === item)) {
        unusedKeys.push(key)
      }
    })
    return unusedKeys
  }

  allTranslations.forEach((foreignKeys) => {
    console.log("--------------------")
    console.log(`Unused Public Site ${foreignKeys.language} Keys:`)
    const unusedForeignKeys: string[] = getUnusedForeignKeys(
      englishTranslations,
      foreignKeys.translationKeys
    )
    unusedForeignKeys.forEach((unusedKey) => console.log(unusedKey))
  })
}

void main()

export {}
