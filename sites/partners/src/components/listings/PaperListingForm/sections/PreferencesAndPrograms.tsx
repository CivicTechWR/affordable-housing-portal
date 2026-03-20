import React from "react"
import {
  MultiselectQuestion,
  MultiselectQuestionsApplicationSectionEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { t } from "@bloom-housing/ui-components"
import SelectAndOrder from "./SelectAndOrder"
import { useJurisdictionalMultiselectQuestionList } from "../../../../lib/hooks"
import { FormListing } from "../../../../lib/listings/formTypes"

type ProgramsAndPreferencesProps = {
  disableListingPreferences?: boolean
  swapCommunityTypeWithPrograms?: boolean
  listing?: FormListing
  jurisdiction: string
  preferences: MultiselectQuestion[]
  setPreferences: (multiselectQuestions: MultiselectQuestion[]) => void
  programs: MultiselectQuestion[]
  setPrograms: (multiselectQuestions: MultiselectQuestion[]) => void
}

const ProgramsAndPreferences = ({
  disableListingPreferences,
  swapCommunityTypeWithPrograms,
  listing,
  jurisdiction,
  preferences,
  setPreferences,
  programs,
  setPrograms,
}: ProgramsAndPreferencesProps) => {
  return (
    <>
      {!disableListingPreferences && (
        <SelectAndOrder
          addText={t("listings.addPreference")}
          applicationSection={MultiselectQuestionsApplicationSectionEnum.preferences}
          dataFetcher={useJurisdictionalMultiselectQuestionList}
          drawerButtonText={t("listings.selectPreferences")}
          drawerButtonId="select-preferences-button"
          drawerSubtitle={
            process.env.showLottery && listing?.lotteryOptIn
              ? t("listings.lotteryPreferenceSubtitle")
              : null
          }
          drawerTitle={t("listings.addPreferences")}
          editText={t("listings.editPreferences")}
          formKey={"preference"}
          jurisdiction={jurisdiction}
          listingData={preferences || []}
          setListingData={setPreferences}
          subtitle={t("listings.sections.housingPreferencesSubtext")}
          title={t("listings.sections.housingPreferencesTitle")}
        />
      )}
      {swapCommunityTypeWithPrograms && (
        <SelectAndOrder
          addText={t("listings.addCommunityTypes")}
          applicationSection={MultiselectQuestionsApplicationSectionEnum.programs}
          dataFetcher={useJurisdictionalMultiselectQuestionList}
          drawerButtonText={t("listings.selectCommunityTypes")}
          drawerButtonId="select-community-types-button"
          drawerTitle={t("listings.addCommunityTypes")}
          editText={t("listings.editCommunities")}
          formKey={"program"}
          jurisdiction={jurisdiction}
          listingData={programs || []}
          setListingData={setPrograms}
          subNote={`${t("listing.choosePopulations")}.`}
          subtitle={t("listings.sections.communityType.tellUs")}
          title={t("t.communityTypes")}
        />
      )}
    </>
  )
}

export default ProgramsAndPreferences
