import React, { useEffect, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { t, Field, Select, FieldGroup } from "@bloom-housing/ui-components"
import { FieldValue, Grid } from "@bloom-housing/ui-seeds"
import { stateKeys, Map, LatitudeLongitude, forwardGeocode } from "@bloom-housing/shared-helpers"
import { EnumListingListingType } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { FormListing } from "../../../../lib/listings/formTypes"
import {
  defaultFieldProps,
  fieldHasError,
  fieldIsRequired,
  fieldMessage,
  getAddressErrorMessage,
  getLabel,
} from "../../../../lib/helpers"
import SectionWithGrid from "../../../shared/SectionWithGrid"
import styles from "../ListingForm.module.scss"

type BuildingDetailsProps = {
  customMapPositionChosen?: boolean
  enableConfigurableRegions?: boolean
  enableNonRegulatedListings?: boolean
  latLong?: LatitudeLongitude
  listing?: FormListing
  regions?: string[]
  requiredFields: string[]
  setCustomMapPositionChosen?: (customMapPosition: boolean) => void
  setLatLong?: (latLong: LatitudeLongitude) => void
}

const WATERLOO_ON_COORDINATES: LatitudeLongitude = {
  latitude: 43.4701994,
  longitude: -80.5452429,
}

const hasValidCoordinates = (coordinates?: LatitudeLongitude) => {
  return (
    typeof coordinates?.latitude === "number" &&
    Number.isFinite(coordinates.latitude) &&
    typeof coordinates?.longitude === "number" &&
    Number.isFinite(coordinates.longitude)
  )
}

const BuildingDetails = ({
  customMapPositionChosen,
  enableNonRegulatedListings,
  enableConfigurableRegions,
  latLong,
  listing,
  regions,
  requiredFields,
  setCustomMapPositionChosen,
  setLatLong,
}: BuildingDetailsProps) => {
  const formMethods = useFormContext()
  const [geocodingError, setGeocodingError] = useState(false)

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, control, getValues, setValue, errors, clearErrors } = formMethods

  interface BuildingAddress {
    city: string
    state: string
    street: string
    zipCode: string
  }

  const buildingAddress: BuildingAddress = useWatch({
    control,
    name: "listingsBuildingAddress",
  })

  const mapPinPosition = useWatch({
    control,
    name: "mapPinPosition",
  })

  const listingType = useWatch({
    control,
    name: "listingType",
  })

  const displayMapPreview = () => {
    return (
      buildingAddress?.city &&
      buildingAddress?.state &&
      buildingAddress?.street &&
      buildingAddress?.zipCode &&
      buildingAddress?.zipCode.length >= 5
    )
  }

  const getNewLatLong = async () => {
    if (
      buildingAddress?.city &&
      buildingAddress?.state &&
      buildingAddress?.street &&
      buildingAddress?.zipCode
    ) {
      try {
        const coordinates = await forwardGeocode(
          `${buildingAddress.street}, ${buildingAddress.city}, ${buildingAddress.state}, ${buildingAddress.zipCode}, Canada`
        )
        setLatLong?.(coordinates)
        setGeocodingError(false)
      } catch (err) {
        console.warn("Geocoding failed for building address:", err)
        setLatLong?.({
          latitude: null,
          longitude: null,
        })
        setGeocodingError(true)
      }
    }
  }
  useEffect(() => {
    let timeout
    if (!customMapPositionChosen || mapPinPosition === "automatic") {
      timeout = setTimeout(() => {
        void getNewLatLong()
      }, 1000)
    }
    return () => {
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    buildingAddress?.city,
    buildingAddress?.state,
    buildingAddress?.street,
    buildingAddress?.zipCode,
  ])

  useEffect(() => {
    if (mapPinPosition === "automatic") {
      void getNewLatLong()
      setCustomMapPositionChosen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapPinPosition])

  const configurableRegion = useWatch({
    control,
    name: "configurableRegion",
  })

  useEffect(() => {
    if (regions && listing?.configurableRegion && configurableRegion === "") {
      setValue("configurableRegion", listing.configurableRegion)
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing, regions, setValue])

  const getError = (subfield: string) => {
    return getAddressErrorMessage(
      `listingsBuildingAddress.${subfield}`,
      "listingsBuildingAddress",
      fieldMessage(
        errors?.listingsBuildingAddress ? errors?.listingsBuildingAddress[subfield] : null
      ),
      errors,
      getValues
    )
  }

  const eitherRegionEnabled = enableConfigurableRegions
  const mapPreviewCoordinates =
    mapPinPosition === "custom" && !hasValidCoordinates(latLong) ? WATERLOO_ON_COORDINATES : latLong

  return (
    <>
      <hr className="spacer-section-above spacer-section" />
      <SectionWithGrid
        heading={t("listings.sections.buildingDetailsTitle")}
        subheading={t("listings.sections.buildingDetailsSubtitle")}
      >
        <SectionWithGrid.HeadingRow>
          {t("listings.sections.buildingAddress")}
        </SectionWithGrid.HeadingRow>
        <Grid.Row columns={3}>
          <Grid.Cell className="seeds-grid-span-2">
            <Field
              label={getLabel(
                "listingsBuildingAddress",
                requiredFields,
                t("application.contact.streetAddress")
              )}
              name={"listingsBuildingAddress.street"}
              id={"listingsBuildingAddress.street"}
              error={!!getError("street")}
              errorMessage={getError("street")}
              inputProps={{
                onChange: () =>
                  fieldHasError(errors?.listingsBuildingAddress?.street) &&
                  clearErrors("listingsBuildingAddress"),
                "aria-required": fieldIsRequired("listingsBuildingAddress", requiredFields),
              }}
              register={register}
            />
          </Grid.Cell>
        </Grid.Row>
        <Grid.Row columns={6}>
          <Grid.Cell className={"seeds-grid-span-2"}>
            <Field
              label={getLabel(
                "listingsBuildingAddress",
                requiredFields,
                t("application.contact.city")
              )}
              name={"listingsBuildingAddress.city"}
              id={"listingsBuildingAddress.city"}
              error={!!getError("city")}
              errorMessage={getError("city")}
              inputProps={{
                onChange: () =>
                  fieldHasError(errors?.listingsBuildingAddress?.city) &&
                  clearErrors("listingsBuildingAddress"),
                "aria-required": fieldIsRequired("listingsBuildingAddress", requiredFields),
              }}
              register={register}
            />
          </Grid.Cell>
          <Grid.Cell>
            <Select
              id={`listingsBuildingAddress.state`}
              name={`listingsBuildingAddress.state`}
              error={!!getError("state")}
              errorMessage={getError("state")}
              label={getLabel(
                "listingsBuildingAddress",
                requiredFields,
                t("application.contact.state")
              )}
              register={register}
              controlClassName="control"
              options={stateKeys}
              keyPrefix="states"
              inputProps={{
                onChange: () =>
                  fieldHasError(errors?.listingsBuildingAddress?.state) &&
                  clearErrors("listingsBuildingAddress"),
                "aria-required": fieldIsRequired("listingsBuildingAddress", requiredFields),
              }}
            />
          </Grid.Cell>
          <Grid.Cell>
            <Field
              label={getLabel(
                "listingsBuildingAddress",
                requiredFields,
                t("application.contact.zip")
              )}
              name={"listingsBuildingAddress.zipCode"}
              id={"listingsBuildingAddress.zipCode"}
              error={!!getError("zipCode")}
              errorMessage={getError("zipCode")}
              inputProps={{
                onChange: () =>
                  fieldHasError(errors?.listingsBuildingAddress?.zipCode) &&
                  clearErrors("listingsBuildingAddress"),
                "aria-required": fieldIsRequired("listingsBuildingAddress", requiredFields),
              }}
              register={register}
            />
          </Grid.Cell>
          <Grid.Cell className="seeds-grid-span-2">
            {enableConfigurableRegions && (
              <Select
                register={register}
                controlClassName="control"
                options={[
                  { value: "", label: t("listings.sections.regionPlaceholder") },
                  ...(regions?.map((entry) => ({
                    value: entry,
                    label: entry,
                  })) ?? []),
                ]}
                {...defaultFieldProps(
                  "configurableRegion",
                  t("t.region"),
                  requiredFields,
                  errors,
                  clearErrors
                )}
                defaultValue={listing?.configurableRegion || ""}
              />
            )}
            {!eitherRegionEnabled &&
              (listingType === EnumListingListingType.regulated || !enableNonRegulatedListings) && (
                <Field
                  type={"number"}
                  register={register}
                  {...defaultFieldProps(
                    "yearBuilt",
                    t("listings.yearBuilt"),
                    requiredFields,
                    errors,
                    clearErrors
                  )}
                />
              )}
          </Grid.Cell>
        </Grid.Row>
        {eitherRegionEnabled &&
          (listingType === EnumListingListingType.regulated || !enableNonRegulatedListings) && (
            <Grid.Row columns={3}>
              <Grid.Cell>
                <Field
                  type={"number"}
                  register={register}
                  {...defaultFieldProps(
                    "yearBuilt",
                    t("listings.yearBuilt"),
                    requiredFields,
                    errors,
                    clearErrors
                  )}
                />
              </Grid.Cell>
            </Grid.Row>
          )}
        <Grid.Row columns={3}>
          <Grid.Cell className="seeds-grid-span-2">
            <FieldValue label={t("listings.mapPreview")} className={styles["custom-label"]}>
              {displayMapPreview() ? (
                <>
                  {geocodingError && mapPinPosition !== "custom" ? (
                    <div
                      className={"w-full p-3 flex items-center justify-center"}
                      style={{
                        height: "400px",
                        backgroundColor: "#fef3cd",
                        border: "1px solid #ffc107",
                        color: "#856404",
                      }}
                    >
                      {t("listings.mapPreviewGeocodingError")}
                    </div>
                  ) : (
                    <Map
                      listingName={listing?.name}
                      address={{
                        city: buildingAddress.city,
                        state: buildingAddress.state,
                        street: buildingAddress.street,
                        zipCode: buildingAddress.zipCode,
                        latitude: mapPreviewCoordinates?.latitude,
                        longitude: mapPreviewCoordinates?.longitude,
                      }}
                      enableCustomPinPositioning={mapPinPosition === "custom"}
                      setCustomMapPositionChosen={setCustomMapPositionChosen}
                      setLatLong={setLatLong}
                    />
                  )}
                </>
              ) : (
                <div
                  className={"w-full bg-gray-400 p-3 flex items-center justify-center"}
                  style={{ height: "400px" }}
                >
                  {t("listings.mapPreviewNoAddress")}
                </div>
              )}
            </FieldValue>
          </Grid.Cell>
          <Grid.Cell>
            <FieldGroup
              name="mapPinPosition"
              type="radio"
              groupLabel={t("listings.mapPinPosition")}
              fieldLabelClassName={styles["label-option"]}
              fieldGroupClassName={"flex-col"}
              fieldClassName={"ml-0"}
              register={register}
              fields={[
                {
                  label: t("t.automatic"),
                  value: "automatic",
                  id: "automatic",
                  note: t("listings.mapPinAutomaticDescription"),
                  defaultChecked: !listing?.customMapPin,
                },
                {
                  label: t("t.custom"),
                  value: "custom",
                  id: "custom",
                  note: t("listings.mapPinCustomDescription"),
                  defaultChecked: listing?.customMapPin,
                },
              ]}
            />
          </Grid.Cell>
        </Grid.Row>
      </SectionWithGrid>
    </>
  )
}

export default BuildingDetails
