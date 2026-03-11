import {
  MarketingTypeEnum,
  MarketingSeasonEnum,
  YesNoEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import Formatter from "./Formatter"
import { createDate, createTime } from "../helpers"

export default class DatesFormatter extends Formatter {
  /** Set dates/times for certain fields */
  process() {
    this.data.applicationDueDate = null

    if (this.data.arePostmarksConsidered === YesNoEnum.yes && this.data.postmarkByDateDateField) {
      const postmarkByDateFormatted = createDate(this.data.postmarkByDateDateField)
      this.data.postmarkedApplicationsReceivedByDate =
        this.data.postmarkByDateTimeField?.hours && this.data.postmarkByDateTimeField?.minutes
          ? createTime(postmarkByDateFormatted, this.data.postmarkByDateTimeField)
          : postmarkByDateFormatted
    } else {
      this.data.postmarkedApplicationsReceivedByDate = null
    }

    this.data.marketingType = MarketingTypeEnum[this.data.marketingType]

    if (this.data.marketingType === MarketingTypeEnum.comingSoon) {
      this.data.marketingYear = this.data.marketingYear ? Number(this.data.marketingYear) : null
      this.data.marketingSeason = this.data.marketingSeason
        ? MarketingSeasonEnum[this.data.marketingSeason]
        : null
    } else {
      this.data.marketingYear = null
      this.data.marketingSeason = null
    }
  }
}
