import React from "react"
import Head from "next/head"
import {
  UnitTypeEnum,
  UnitRentTypeEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import Layout from "../layouts/application"
import { UnitView } from "../components/unit/UnitView"

/**
 * Temporary preview page for the UnitView component.
 * Visit http://localhost:3000/unit-preview to see it.
 *
 * TODO: Remove this page before production release.
 */

const mockUnit = {
  id: "preview-unit-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  number: "204",
  floor: 3,
  numBedrooms: 2,
  numBathrooms: 1,
  sqFeet: "850",
  minOccupancy: 2,
  maxOccupancy: 4,
  monthlyRent: "1450",
  annualIncomeMin: "38000",
  annualIncomeMax: "72000",
  monthlyIncomeMin: "3167",
  amiPercentage: "60",
  monthlyRentAsPercentOfIncome: null,
  bmrProgramChart: false,
  unitTypes: {
    id: "type-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    name: UnitTypeEnum.twoBdrm,
    numBedrooms: 2,
  },
  unitRentTypes: {
    id: "rent-type-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    name: UnitRentTypeEnum.fixed,
  },
  unitAccessibilityPriorityTypes: {
    id: "access-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    name: "Mobility",
  },
}

const mockListing = {
  id: "preview-listing-1",
  name: "Sunnyvale Affordable Apartments",
  urlSlug: "sunnyvale-affordable-apartments",
  developer: "Community Housing Partners",
  listingsBuildingAddress: {
    id: "addr-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    placeName: null,
    city: "Waterloo",
    county: null,
    state: "ON",
    street: "123 King Street",
    street2: null,
    zipCode: "N2J 1N9",
    latitude: 43.4643,
    longitude: -80.5204,
  },
}

export default function UnitPreviewPage() {
  return (
    <Layout>
      <Head>
        <title>Unit View Preview</title>
      </Head>
      <UnitView
        unit={mockUnit}
        listing={mockListing as never}
        additionalFeatures={[
          { heading: "In-unit laundry", subheading: "Washer and dryer included" },
          { heading: "Pet policy", subheading: "Cats allowed, no dogs" },
        ]}
      />
    </Layout>
  )
}
