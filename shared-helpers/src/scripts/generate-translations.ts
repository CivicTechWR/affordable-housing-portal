/* eslint-disable @typescript-eslint/no-var-requires */
// Prints out a combination of an inputted csv file and existing translations file
// The CSV of the new translations must be in the format "key,value"
// Temporarily update the ui-components tsconfig to include `"module": "commonjs"`
// example: `ts-node generate-translations fr new-french.csv > merged-french-translations.json`
const fs = require("fs")
const general = require("../locales/general.json")
const fr = require("../locales/fr.json")

function main() {
  if (process.argv.length < 4) {
    console.log(
      "usage: ts-node generate-translations fr new-french.csv > merged-french-translations.json"
    )
    process.exit(1)
  }

  const languageMap = {
    general: general,
    fr: fr,
  }

  const [language, filePath] = process.argv.slice(2)

  // Process existing keys
  const mergedTranslations: string[] = []
  Object.keys(languageMap[language]).forEach((key) => {
    const formattedTranslation = `"${key}": "${languageMap[language][key]}",`
    mergedTranslations.push(JSON.stringify(formattedTranslation))
  })

  // Add new keys if not present
  const newTranslationsFile: any = fs.readFileSync(filePath, "utf-8")
  const newTranslations = newTranslationsFile.split("\n")
  newTranslations.forEach((translation: string) => {
    const [key, ...values] = translation.split(",")
    const value = values.join("_")
    if (!mergedTranslations[key]) {
      const formattedTranslation = `"${key}": "${value}",`
      mergedTranslations.push(JSON.stringify(formattedTranslation))
    }
  })

  mergedTranslations.sort()
  console.log("{")
  mergedTranslations.forEach((translation) => {
    console.log(JSON.parse(translation))
  })
  console.log("}")
}

void main()

export {}
