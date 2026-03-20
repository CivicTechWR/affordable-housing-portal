import { useContext, useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/router"
import qs from "qs"
import {
  EnumListingFilterParamsComparison,
  EnumMultiselectQuestionFilterParamsComparison,
  FeatureFlagEnum,
  FilterAvailabilityEnum,
  Jurisdiction,
  Listing,
  ListingFilterParams,
  ListingOrderByKeys,
  ListingsStatusEnum,
  MultiselectQuestion,
  MultiselectQuestionsApplicationSectionEnum,
  MultiselectQuestionFilterParams,
  OrderByEnum,
  PaginatedListing,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { ParsedUrlQuery } from "querystring"
import { AppSubmissionContext } from "./applications/AppSubmissionContext"
import {
  useRequireLoggedInUser,
  isInternalLink,
  AuthContext,
  useToastyRef,
} from "@bloom-housing/shared-helpers"
import { t } from "@bloom-housing/ui-components"
import { fetchFavoriteListingIds } from "./helpers"

/**
 * This ensures a listing is present in memory and no application has yet been submitted
 * @param listing
 * @param application
 */
export const useAuthenticApplicationCheckpoint = (
  listing: Listing,
  application: Record<string, unknown>
) => {
  const router = useRouter()
  const toastyRef = useToastyRef()
  const { profile } = useContext(AuthContext)

  useEffect(() => {
    const { addToast } = toastyRef.current

    // redirect to the listings page if a listing hasn't been loaded
    if (!listing) {
      addToast(t("application.timeout.afterMessage"), { variant: "alert" })
      void router.push("/listings")
      return
    }

    // redirect to the applications (logged-in state) or the listing page (non-logged-in state)
    // if the application has been submitted already
    if (application.confirmationCode) {
      addToast(t("listings.applicationAlreadySubmitted"), { variant: "alert" })
      void router.push(
        profile ? `/account/applications` : `/listing/${listing.id}/${listing.urlSlug}`
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toastyRef]) // ensure this only runs once on the page
}

export const useRedirectToPrevPage = (defaultPath = "/") => {
  const router = useRouter()

  return (queryParams: ParsedUrlQuery = {}) => {
    const redirectUrl =
      typeof router.query.redirectUrl === "string" && isInternalLink(router.query.redirectUrl)
        ? router.query.redirectUrl
        : defaultPath
    const redirectParams = { ...queryParams }
    if (router.query.listingId) redirectParams.listingId = router.query.listingId

    return router.push({ pathname: redirectUrl, query: redirectParams })
  }
}

/**
 * Hook for use in the Common Application form steps
 * @param stepName
 * @param bypassCheckpoint true if it should bypass checking that listing & application is in progress
 * @returns
 */
export const useFormConductor = (stepName: string) => {
  useRequireLoggedInUser("/", !process.env.showMandatedAccounts)
  const context = useContext(AppSubmissionContext)
  const conductor = context.conductor
  useAuthenticApplicationCheckpoint(conductor.listing, conductor.application)

  conductor.stepTo(stepName)

  useEffect(() => {
    conductor.skipCurrentStepIfNeeded()
  }, [conductor])
  return context
}

export const useProfileFavoriteListings = () => {
  const { profile, listingsService, userService } = useContext(AuthContext)
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState<PaginatedListing>({ items: [] } as PaginatedListing)

  useEffect(() => {
    if (profile && loading) {
      void fetchFavoriteListingIds(profile.id, userService).then((listingIds) => {
        if (listingIds.length > 0) {
          listingsService
            .list({
              filter: [
                {
                  $comparison: EnumListingFilterParamsComparison.IN,
                  ids: listingIds,
                },
              ],
              limit: "all",
            })
            .then((res) => {
              setListings(res)
            })
            .catch((err) => {
              console.error(`Error fetching listings: ${err}`)
            })
            .finally(() => setLoading(false))
        } else {
          setListings({ items: [] } as PaginatedListing)
          setLoading(false)
        }
      })
    }
  }, [profile, loading, userService, listingsService])

  return [listings.items, loading] as [Listing[], boolean]
}

/**
 * Fetches listings for the public site using the singleton site configuration as the
 * source of the active jurisdiction id and site-level feature flags.
 *
 * @param options - Listing pagination, sorting, and extra filters to apply.
 * @param req - The incoming server request, when available, for forwarding client IP data.
 * @returns A base listing payload containing items and optional pagination metadata.
 * Request failures are logged and result in an empty payload shape.
 */
export async function fetchBaseListingData(
  {
    page,
    additionalFilters,
    orderBy,
    orderDir,
    limit,
  }: {
    page?: number
    additionalFilters?: ListingFilterParams[]
    orderBy?: ListingOrderByKeys[]
    orderDir?: OrderByEnum[]
    limit?: string
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any
) {
  let listings
  let pagination
  try {
    // The public site still scopes listings to the singleton site configuration record.
    const currentSiteConfig = await fetchSiteConfig(req)
    const jurisdictionId = currentSiteConfig?.id
    const featureFlags = currentSiteConfig?.featureFlags ?? []

    if (!jurisdictionId) {
      return listings
    }
    let filter: ListingFilterParams[] = [
      {
        $comparison: EnumListingFilterParamsComparison["="],
        jurisdiction: jurisdictionId,
      },
    ]

    if (additionalFilters) {
      filter = filter.concat(additionalFilters)
    }
    const params: {
      page?: number
      view: string
      limit: string
      filter: ListingFilterParams[]
      orderBy?: ListingOrderByKeys[]
      orderDir?: OrderByEnum[]
    } = {
      view: "base",
      limit: limit || "all",
      filter,
    }

    // Pagination remains feature-flagged, so read it from site config rather than a user object.
    const enablePagination =
      featureFlags.find((flag) => flag.name === FeatureFlagEnum.enableListingPagination)?.active ||
      false

    if (page && enablePagination) {
      params.page = page
    }
    if (orderBy) {
      params.orderBy = orderBy
    }
    if (orderDir) {
      params.orderDir = orderDir
    }
    const response = await axios.post(`${process.env.listingServiceUrl}/list`, params, {
      headers: {
        passkey: process.env.API_PASS_KEY,
        "x-forwarded-for": req?.headers["x-forwarded-for"] ?? req?.socket?.remoteAddress,
      },
    })

    listings = response.data.items
    pagination = enablePagination ? response.data.meta : null
  } catch (e) {
    console.log("fetchBaseListingData error: ", e)
  }

  return {
    items: listings,
    meta: pagination,
  }
}

export async function fetchOpenListings(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any,
  page: number,
  additionalFilters: ListingFilterParams[] = []
) {
  return await fetchBaseListingData(
    {
      page: page,
      additionalFilters: [
        {
          $comparison: EnumListingFilterParamsComparison["="],
          status: ListingsStatusEnum.active,
        },
        ...additionalFilters,
      ],
      orderBy: [
        ListingOrderByKeys.marketingType,
        ListingOrderByKeys.marketingYear,
        ListingOrderByKeys.marketingSeason,
        ListingOrderByKeys.mostRecentlyPublished,
      ],
      orderDir: [OrderByEnum.desc, OrderByEnum.asc, OrderByEnum.asc, OrderByEnum.desc],
      limit: process.env.maxBrowseListings,
    },
    req
  )
}

export async function fetchClosedListings(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any,
  page: number,
  additionalFilters: ListingFilterParams[] = []
) {
  return await fetchBaseListingData(
    {
      page: page,
      additionalFilters: [
        {
          $comparison: EnumListingFilterParamsComparison["="],
          status: ListingsStatusEnum.closed,
        },
        ...additionalFilters,
      ],
      orderBy: [ListingOrderByKeys.mostRecentlyClosed],
      orderDir: [OrderByEnum.desc],
      limit: process.env.maxBrowseListings,
    },
    req
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchLimitedUnderConstructionListings(req?: any, limit?: number) {
  return await fetchBaseListingData(
    {
      additionalFilters: [
        {
          $comparison: EnumListingFilterParamsComparison["="],
          status: ListingsStatusEnum.active,
          availability: FilterAvailabilityEnum.comingSoon,
        },
      ],
      orderBy: [ListingOrderByKeys.mostRecentlyPublished],
      orderDir: [OrderByEnum.desc],
      limit: limit ? limit.toString() : "3",
    },
    req
  )
}

let siteConfig: Jurisdiction | null = null

/**
 * Loads the singleton site configuration used by the public site.
 *
 * @param req - The incoming server request, when available, for forwarding client IP data.
 * @returns The cached singleton site configuration or `null` if it cannot be loaded.
 * Request failures are logged and return `null`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchSiteConfig(req?: any) {
  try {
    if (siteConfig) {
      return siteConfig
    }

    const headers = {
      passkey: process.env.API_PASS_KEY,
    }
    if (req) {
      headers["x-forwarded-for"] = req.headers["x-forwarded-for"] ?? req.socket.remoteAddress
    }

    // The API still exposes jurisdictions, but the public site only consumes the singleton row.
    const jurisdictionsRes = await axios.get(`${process.env.backendApiBase}/jurisdictions`, {
      headers,
    })
    siteConfig = jurisdictionsRes?.data?.[0] ?? null
  } catch (error) {
    console.log("error = ", error)
  }

  return siteConfig
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchMultiselectProgramData(
  req: any,
  jurisdictionId: string
): Promise<MultiselectQuestion[]> {
  try {
    const headers = {
      passkey: process.env.API_PASS_KEY,
    }
    if (req) {
      headers["x-forwarded-for"] = req.headers["x-forwarded-for"] ?? req.socket.remoteAddress
    }

    const params: {
      filter: MultiselectQuestionFilterParams[]
    } = {
      filter: [
        {
          $comparison: EnumMultiselectQuestionFilterParamsComparison["="],
          applicationSection: MultiselectQuestionsApplicationSectionEnum.programs,
        },
        {
          $comparison: EnumMultiselectQuestionFilterParamsComparison["IN"],
          jurisdiction: jurisdictionId && jurisdictionId !== "" ? jurisdictionId : undefined,
        },
      ],
    }

    const paramsString = qs.stringify(params)

    const multiselectDataResponse = await axios.get(
      `${process.env.backendApiBase}/multiselectQuestions?${paramsString}`,
      {
        headers,
      }
    )

    const responseData = multiselectDataResponse?.data
    if (Array.isArray(responseData)) {
      return responseData
    }
    if (Array.isArray(responseData?.items)) {
      return responseData.items
    }

    return []
  } catch (error) {
    console.log("error = ", error)
    return []
  }
}
