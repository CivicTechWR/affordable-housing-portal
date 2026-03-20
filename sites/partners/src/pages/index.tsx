import React, { useMemo, useContext, useState } from "react"
import Head from "next/head"
import DocumentArrowDownIcon from "@heroicons/react/24/solid/DocumentArrowDownIcon"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"
import dayjs from "dayjs"
import { ColDef, ColGroupDef } from "ag-grid-community"
import { Button, Dialog, Grid, Icon } from "@bloom-housing/ui-seeds"
import {
  t,
  AgTable,
  useAgTable,
  Form,
  Field,
} from "@bloom-housing/ui-components"
import { AuthContext } from "@bloom-housing/shared-helpers"
import {
  EnumListingListingType,
  FeatureFlagEnum,
  ListingTypeEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { useListingExport, useListingsData } from "../lib/hooks"
import Layout from "../layouts"
import { MetaTags } from "../components/shared/MetaTags"
import { NavigationHeader } from "../components/shared/NavigationHeader"

class formatLinkCell {
  link: HTMLAnchorElement

  init(params) {
    this.link = document.createElement("a")
    this.link.classList.add("text-blue-700")
    this.link.setAttribute("href", `/listings/${params.data.id}/applications`)
    this.link.innerText = params.valueFormatted || params.value
    this.link.style.textDecoration = "underline"
  }

  getGui() {
    return this.link
  }
}

class formatWaitlistStatus {
  text: HTMLSpanElement

  init({ data }) {
    const isWaitlistOpen = data.waitlistOpenSpots > 0

    this.text = document.createElement("span")
    this.text.innerHTML = isWaitlistOpen ? t("t.yes") : t("t.no")
  }

  getGui() {
    return this.text
  }
}

class formatIsVerified {
  text: HTMLSpanElement

  init({ data }) {
    this.text = document.createElement("span")
    this.text.innerHTML = data.isVerified ? t("t.yes") : t("t.no")
  }

  getGui() {
    return this.text
  }
}

class ApplicationsLink extends formatLinkCell {
  init(params) {
    super.init(params)
    this.link.setAttribute("href", `/listings/${params.data.id}/applications`)
    this.link.setAttribute("data-testid", `listing-status-cell-${params.data.name}`)
  }
}

class ListingsLink extends formatLinkCell {
  init(params) {
    super.init(params)
    this.link.setAttribute("href", `/listings/${params.data.id}`)
    this.link.setAttribute("data-testid", params.data.name)
  }
}

export const getFlagInAllJurisdictions = (
  flagName: FeatureFlagEnum,
  activeState: boolean,
  isFeatureFlagOn: (featureFlag: string) => boolean
) => {
  const flagOn = isFeatureFlagOn(flagName)
  return activeState ? flagOn : !flagOn
}

type CreateListingFormFields = {
  listingType: ListingTypeEnum
}

export default function ListingsList() {
  const metaDescription = t("pageDescription.welcome", { regionName: t("region.name") })
  const { profile, isFeatureFlagOn, siteConfig } = useContext(AuthContext)
  const isAdmin =
    profile?.userRoles?.isAdmin ||
    profile?.userRoles?.isSupportAdmin ||
    profile?.userRoles?.isJurisdictionalAdmin ||
    profile?.userRoles?.isLimitedJurisdictionalAdmin ||
    false
  const canAddListing = isAdmin || profile?.userRoles?.isPartner || false
  const { onExport, csvExportLoading } = useListingExport()
  const router = useRouter()
  const tableOptions = useAgTable()

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, handleSubmit } = useForm<CreateListingFormFields>()

  const [listingSelectModal, setListingSelectModal] = useState(false)

  const jurisdictionId = siteConfig?.id

  const gridComponents = {
    ApplicationsLink,
    formatLinkCell,
    formatWaitlistStatus,
    formatIsVerified,
    ListingsLink,
  }

  const isNonRegulatedEnabled = isFeatureFlagOn(
    FeatureFlagEnum.enableNonRegulatedListings
  )

  const onModalClose = () => {
    setListingSelectModal(false)
  }

  const columnDefs = useMemo(() => {
    const columns: (ColDef | ColGroupDef)[] = [
      {
        headerName: t("listings.listingName"),
        field: "name",
        sortable: true,
        unSortIcon: true,
        filter: false,
        resizable: true,
        cellRenderer: "ListingsLink",
        minWidth: 250,
        flex: 1,
      },
    ]

    if (isNonRegulatedEnabled) {
      columns.push({
        headerName: t("listings.listingType"),
        field: "listingType",
        sortable: true,
        unSortIcon: true,
        filter: false,
        resizable: true,
        cellRenderer: "ListingsLink",
        minWidth: 140,
        comparator: () => 0,
        valueFormatter: ({ value }) => {
          if (!value) {
            return t("t.none")
          }

          return t(`listings.${value}`)
        },
      })
    }

    columns.push(
      {
        headerName: t("listings.listingStatusText"),
        field: "status",
        sortable: true,
        unSortIcon: true,
        sort: "asc",
        // disable frontend sorting
        comparator: () => 0,
        filter: false,
        resizable: true,
        valueFormatter: ({ value }) => t(`listings.listingStatus.${value}`),
        cellRenderer: !profile?.userRoles?.isLimitedJurisdictionalAdmin ? "ApplicationsLink" : "",
        minWidth: 190,
      },
      {
        headerName: t("listings.createdDate"),
        field: "createdAt",
        sortable: false,
        filter: false,
        resizable: true,
        valueFormatter: ({ value }) => (value ? dayjs(value).format("MM/DD/YYYY") : t("t.none")),
        maxWidth: 140,
      },
      {
        headerName: t("listings.publishedDate"),
        field: "publishedAt",
        sortable: false,
        filter: false,
        resizable: true,
        valueFormatter: ({ value }) => (value ? dayjs(value).format("MM/DD/YYYY") : t("t.none")),
        maxWidth: 150,
      },
      {
        headerName: t("listings.applicationDueDate"),
        field: "applicationDueDate",
        sortable: false,
        filter: false,
        resizable: true,
        valueFormatter: ({ value }) => (value ? dayjs(value).format("MM/DD/YYYY") : t("t.none")),
        maxWidth: 120,
      }
    )

    if (
      getFlagInAllJurisdictions(
        FeatureFlagEnum.enableIsVerified,
        true,
        isFeatureFlagOn
      )
    ) {
      columns.push({
        headerName: t("t.verified"),
        field: "isVerified",
        sortable: false,
        filter: false,
        resizable: true,
        cellRenderer: "formatIsVerified",
        maxWidth: 100,
      })
    }

    if (
      getFlagInAllJurisdictions(
        FeatureFlagEnum.enableUnitGroups,
        false,
        isFeatureFlagOn
      )
    ) {
      columns.push(
        {
          headerName: t("listings.availableUnits"),
          field: "unitsAvailable",
          sortable: false,
          filter: false,
          resizable: true,
          maxWidth: 120,
        },
        {
          headerName: t("listings.waitlist.open"),
          field: "waitlistCurrentSize",
          sortable: false,
          filter: false,
          resizable: true,
          cellRenderer: "formatWaitlistStatus",
          maxWidth: 160,
        }
      )
    }
    if (
      getFlagInAllJurisdictions(
        FeatureFlagEnum.enableListingUpdatedAt,
        true,
        isFeatureFlagOn
      )
    ) {
      columns.push({
        headerName: t("t.lastUpdated"),
        field: "contentUpdatedAt",
        sortable: false,
        filter: false,
        resizable: true,
        valueFormatter: ({ value }) => (value ? dayjs(value).format("MM/DD/YYYY") : t("t.none")),
        maxWidth: 140,
      })
    }

    return columns
    //eslint-disable-next-line
  }, [])

  const { listingDtos, listingsLoading } = useListingsData({
    page: tableOptions.pagination.currentPage,
    limit: tableOptions.pagination.itemsPerPage,
    search: tableOptions.filter.filterValue,
    userId: profile?.id,
    sort: tableOptions.sort.sortOptions,
    roles: profile?.userRoles,
  })

  const onSubmit = (data: CreateListingFormFields) => {
    const query: Record<string, string | boolean> = {
      jurisdictionId: jurisdictionId,
    }
    if (data.listingType === ListingTypeEnum.nonRegulated) {
      query["nonRegulated"] = true
    }
    void router.push({
      pathname: "/listings/add",
      query: query,
    })
  }

  return (
    <Layout>
      <Head>
        <title>{`Home - ${t("nav.siteTitlePartners")}`}</title>
      </Head>
      <MetaTags title={t("nav.siteTitlePartners")} description={metaDescription} />
      <NavigationHeader title={t("nav.listings")}></NavigationHeader>
      <section>
        <article className="flex-row flex-wrap relative max-w-screen-xl mx-auto py-8 px-4">
          <AgTable
            id="listings-table"
            pagination={{
              perPage: tableOptions.pagination.itemsPerPage,
              setPerPage: tableOptions.pagination.setItemsPerPage,
              currentPage: tableOptions.pagination.currentPage,
              setCurrentPage: tableOptions.pagination.setCurrentPage,
            }}
            config={{
              gridComponents,
              columns: columnDefs,
              totalItemsLabel: t("listings.totalListings"),
            }}
            data={{
              items: listingDtos?.items,
              loading: listingsLoading,
              totalItems: listingDtos?.meta.totalItems,
              totalPages: listingDtos?.meta.totalPages,
            }}
            search={{
              setSearch: tableOptions.filter.setFilterValue,
            }}
            sort={{
              setSort: tableOptions.sort.setSortOptions,
            }}
            headerContent={
              <div className="flex gap-2 items-center">
                {canAddListing && (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        if (!isNonRegulatedEnabled) {
                          void router.push({
                            pathname: "/listings/add",
                            query: { jurisdictionId: jurisdictionId },
                          })
                        } else {
                          setListingSelectModal(true)
                        }
                      }}
                      id="addListingButton"
                    >
                      {t("listings.addListing")}
                    </Button>
                    {isAdmin && (
                      <Button
                        id="export-listings"
                        variant="primary-outlined"
                        onClick={() => onExport()}
                        leadIcon={
                          !csvExportLoading ? (
                            <Icon>
                              <DocumentArrowDownIcon />
                            </Icon>
                          ) : null
                        }
                        size="sm"
                        loadingMessage={csvExportLoading && t("t.formSubmitted")}
                      >
                        {t("t.exportToCSV")}
                      </Button>
                    )}
                  </>
                )}
              </div>
            }
          />
        </article>
      </section>

      <Dialog
        isOpen={listingSelectModal}
        ariaLabelledBy="listing-select-dialog-header"
        ariaDescribedBy="listing-select-dialog-content"
        onClose={() => onModalClose()}
      >
        <Form id="listing-select-form" onSubmit={handleSubmit(onSubmit)}>
          <Dialog.Header id="listing-select-dialog-header">
            {t("listings.selectListingType")}
          </Dialog.Header>

          <Dialog.Content id="listing-select-dialog-content">
            <Grid>
              <div aria-live="polite">
                <fieldset>
                  <legend className={`text__caps-spaced`}>
                    {t("listings.listingTypeTitle")}
                  </legend>
                  <Grid.Row columns={4}>
                    <Grid.Cell className={"seeds-grid-span-2"}>
                      <div className="pb-4 sm:pb-0">
                        <Field
                          name="listingType"
                          type="radio"
                          className="mr-4"
                          register={register}
                          id={EnumListingListingType.regulated}
                          label={t("listings.regulated")}
                          inputProps={{
                            value: EnumListingListingType.regulated,
                            defaultChecked: true,
                          }}
                          subNote={t("listings.listingType.regulated.description")}
                        />
                      </div>
                    </Grid.Cell>
                    <Grid.Cell className={"seeds-grid-span-2"}>
                      <div>
                        <Field
                          name="listingType"
                          type="radio"
                          register={register}
                          id={EnumListingListingType.nonRegulated}
                          label={t("listings.nonRegulated")}
                          inputProps={{
                            value: EnumListingListingType.nonRegulated,
                          }}
                          subNote={t("listings.listingType.nonRegulated.description")}
                        />
                      </div>
                    </Grid.Cell>
                  </Grid.Row>
                </fieldset>
              </div>
            </Grid>
          </Dialog.Content>
          <Dialog.Footer>
            <Button variant="primary" size="sm" type={"submit"}>
              {t("listings.getStarted")}
            </Button>
            <Button
              variant="primary-outlined"
              onClick={() => {
                setListingSelectModal(false)
              }}
              size="sm"
              type={"button"}
            >
              {t("t.cancel")}
            </Button>
          </Dialog.Footer>
        </Form>
      </Dialog>
    </Layout>
  )
}
