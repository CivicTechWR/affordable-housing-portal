import React, { useContext } from "react"
import { t, MinimalTable, TableThumbnail } from "@bloom-housing/ui-components"
import { FieldValue, Grid } from "@bloom-housing/ui-seeds"
import { cloudinaryUrlFromId, AuthContext } from "@bloom-housing/shared-helpers"
import { FeatureFlagEnum } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { ListingContext } from "../../ListingContext"
import SectionWithGrid from "../../../shared/SectionWithGrid"

const DetailAdditionalEligibility = () => {
  const listing = useContext(ListingContext)
  const { doJurisdictionsHaveFeatureFlagOn } = useContext(AuthContext)

  const disableBuildingSelectionCriteria = doJurisdictionsHaveFeatureFlagOn(
    FeatureFlagEnum.disableBuildingSelectionCriteria,
    listing.jurisdictions.id
  )

  if (
    disableBuildingSelectionCriteria ||
    (!listing.buildingSelectionCriteria &&
      !listing.listingsBuildingSelectionCriteriaFile?.fileId)
  ) {
    return null
  }

  return (
    <SectionWithGrid heading={t("listings.buildingSelectionCriteria")} inset>
      <Grid.Row columns={1}>
        <Grid.Cell>
          <FieldValue label={t("listings.buildingSelectionCriteria")}>
            {listing.listingsBuildingSelectionCriteriaFile?.fileId ? (
              <MinimalTable
                id="buildingSelectionCriteriaTable"
                headers={{ preview: "t.preview", fileName: "t.fileName" }}
                data={[
                  {
                    preview: {
                      content: (
                        <TableThumbnail>
                          <img
                            alt="PDF preview"
                            src={cloudinaryUrlFromId(
                              listing.listingsBuildingSelectionCriteriaFile.fileId
                            )}
                          />
                        </TableThumbnail>
                      ),
                    },
                    fileName: {
                      content: `${listing.listingsBuildingSelectionCriteriaFile.fileId
                        .split("/")
                        .slice(-1)
                        .join()}.pdf`,
                    },
                  },
                ]}
              />
            ) : (
              <MinimalTable
                id="buildingSelectionCriteriaTable"
                headers={{ url: "t.url" }}
                data={[
                  {
                    url: { content: listing.buildingSelectionCriteria },
                  },
                ]}
              />
            )}
          </FieldValue>
        </Grid.Cell>
      </Grid.Row>
    </SectionWithGrid>
  )
}

export default DetailAdditionalEligibility
