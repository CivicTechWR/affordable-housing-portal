"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { Heart } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import {
  FeatureAccordion,
  type DynamicFilterGroup,
} from "@/components/feature-accordian/FeatureAccordian";
import { DatePicker } from "@/components/date-picker/date-picker";
import { ListingFilters } from "@/components/listing-filter/ListingFilter";
import { useListingFilters } from "@/components/listing-filter/useListingFilter";
import { ListingFilterSearchBar } from "@/components/listing-filter-search-bar/ListingFilterSearchBar";
import {
  ListingsDisplayMode,
  ListingsSidebar,
  type Listing,
} from "@/components/listings-sidebar/listingsSideBar";
import { MapView } from "@/components/map-view/mapView";
import { PriceRangeInput } from "@/components/price-range-input/PriceRangeInput";
import { SortOptions } from "@/components/sort-options/SortOptions";
import { ToggleFilter } from "@/components/toggle-filter/ToggleFilter";
import { ToggleIconButton } from "@/components/toggle-icon-button/ToggleIconButton";

const previewListings: Listing[] = [
  {
    id: "listing-1",
    price: 1825,
    address: "45 Erb St W",
    city: "Waterloo",
    neighborhood: "Uptown",
    beds: 2,
    baths: 1,
    sqft: 840,
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=340&fit=crop",
    timeAgo: "2 days ago",
    lat: 43.4636,
    lng: -80.5264,
    features: ["parking", "laundry", "balcony"],
    availableFrom: "2026-05-01",
    listedAt: "2026-04-19T10:00:00.000Z",
    status: "active",
  },
  {
    id: "listing-2",
    price: 2140,
    address: "18 King St N",
    city: "Kitchener",
    neighborhood: "Downtown",
    beds: 3,
    baths: 2,
    sqft: 1040,
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=340&fit=crop",
    timeAgo: "5 hours ago",
    lat: 43.4516,
    lng: -80.4925,
    features: ["parking", "elevator", "laundry", "wheelchair"],
    availableFrom: "2026-06-15",
    listedAt: "2026-04-21T08:00:00.000Z",
    status: "active",
  },
  {
    id: "listing-3",
    price: 1595,
    address: "77 Weber St E",
    city: "Waterloo",
    neighborhood: "Midtown",
    beds: 1,
    baths: 1,
    sqft: 610,
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=340&fit=crop",
    timeAgo: "Just listed",
    lat: 43.4668,
    lng: -80.5087,
    features: ["laundry", "step-free"],
    availableFrom: "2026-05-10",
    listedAt: "2026-04-21T11:30:00.000Z",
    status: "active",
  },
  {
    id: "listing-4",
    price: 2475,
    address: "12 Duke St",
    city: "Cambridge",
    neighborhood: "Galt",
    beds: 3,
    baths: 2,
    sqft: 1220,
    imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=340&fit=crop",
    timeAgo: "1 week ago",
    lat: 43.3601,
    lng: -80.3149,
    features: ["parking", "balcony", "laundry"],
    availableFrom: "2026-07-01",
    listedAt: "2026-04-14T09:00:00.000Z",
    status: "active",
  },
];

const dynamicGroups: DynamicFilterGroup[] = [
  {
    groupId: "building-features",
    groupLabel: "Building Features",
    options: [
      { id: "parking", label: "Parking", type: "boolean" },
      { id: "laundry", label: "Laundry", type: "boolean" },
      { id: "elevator", label: "Elevator", type: "boolean" },
      { id: "balcony", label: "Balcony", type: "boolean" },
    ],
  },
  {
    groupId: "accessibility",
    groupLabel: "Accessibility",
    options: [
      { id: "step-free", label: "Step-free entry", type: "boolean" },
      { id: "wide-hallways", label: "Wide hallways", type: "boolean" },
    ],
  },
];

function PreviewCard({
  title,
  description,
  children,
}: Readonly<{
  title: string;
  description: string;
  children: React.ReactNode;
}>) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 space-y-2">
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

function PreviewContent() {
  const [priceRange, setPriceRange] = useState({ min: 1200, max: 2600 });
  const [bedrooms, setBedrooms] = useState("2");
  const [moveInDate, setMoveInDate] = useState<Date | undefined>(new Date("2026-05-01"));
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["parking", "balcony"]);
  const [saved, setSaved] = useState(false);
  const {
    sortOptionProps,
    bedroomToggleProps,
    priceRangeProps,
    searchInputProps,
    bathroomToggleProps,
    getFeatureCheckboxProps,
    datePickerProps,
    clearFilters,
  } = useListingFilters();

  const formattedMoveInDate = moveInDate
    ? moveInDate.toLocaleDateString("en-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Pick a move-in date";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                Preview route
              </span>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Component gallery for the housing search UI
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-600">
                  This page uses mock data and local state so you can inspect the current components
                  before wiring the full experience together.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Home
              </Link>
              <Link
                href="/listings"
                className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                Open `/listings`
              </Link>
            </div>
          </div>
        </header>

        <PreviewCard
          title="Full Page Composition"
          description="The current search header, sidebar, filters, and map shell rendered together with mock listings."
        >
          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <Suspense
              fallback={
                <div className="flex h-16 items-center border-b border-slate-200 bg-white px-4" />
              }
            >
              <div className="flex h-16 items-center border-b border-slate-200 bg-white px-4">
                <ListingFilterSearchBar
                  searchInputProps={searchInputProps}
                  priceRangeProps={priceRangeProps}
                  bedroomToggleProps={bedroomToggleProps}
                  bathroomToggleProps={bathroomToggleProps}
                />
              </div>
            </Suspense>
            <div className="grid min-h-[840px] bg-slate-50 xl:grid-cols-[340px_320px_minmax(0,1fr)]">
              <div className="border-b border-slate-200 xl:border-r xl:border-b-0">
                <div className="border-b border-slate-200 bg-white p-4">
                  <SortOptions {...sortOptionProps} />
                </div>
                <ListingsSidebar listings={previewListings} mode={ListingsDisplayMode.SIDESCROLL} />
              </div>
              <div className="border-b border-slate-200 bg-white xl:border-r xl:border-b-0">
                <Suspense fallback={<div className="min-h-[420px] bg-white" />}>
                  <ListingFilters
                    bathroomToggleProps={bathroomToggleProps}
                    bedroomToggleProps={bedroomToggleProps}
                    priceRangeProps={priceRangeProps}
                    getFeatureCheckboxProps={getFeatureCheckboxProps}
                    datePickerProps={datePickerProps}
                    clearFilters={clearFilters}
                    dynamicGroups={dynamicGroups}
                  />
                </Suspense>
              </div>
              <div className="min-h-[420px] xl:min-h-full">
                <MapView listings={previewListings} />
              </div>
            </div>
          </div>
        </PreviewCard>

        <div className="grid gap-6 xl:grid-cols-2">
          <PreviewCard
            title="Standalone Filters"
            description="Useful when you want to tune spacing, labels, and interaction details in isolation."
          >
            <div className="grid gap-8 md:grid-cols-2">
              <ToggleFilter title="Bedrooms" value={bedrooms} onValueChange={setBedrooms} />
              <PriceRangeInput
                min={priceRange.min}
                max={priceRange.max}
                onMinChange={async (min) => {
                  setPriceRange((current) => ({ ...current, min: min ?? 0 }));
                }}
                onMaxChange={async (max) => {
                  setPriceRange((current) => ({ ...current, max: max ?? 0 }));
                }}
              />
              <DatePicker
                selected={moveInDate}
                onSelect={setMoveInDate}
                formattedText={formattedMoveInDate}
              />
              <div className="space-y-4">
                <h3 className="font-medium text-slate-950">Saved Search</h3>
                <ToggleIconButton
                  isActive={saved}
                  onClick={() => setSaved((current) => !current)}
                  icon={<HugeiconsIcon icon={Heart} strokeWidth={1.8} />}
                  aria-label="Toggle save search"
                />
              </div>
            </div>
          </PreviewCard>

          <PreviewCard
            title="Feature Groups"
            description="Accordion and checkbox combinations with local mock state instead of URL-backed filters."
          >
            <div className="space-y-6">
              <FeatureAccordion
                groups={dynamicGroups}
                getCheckboxProps={(id) => ({
                  id: `preview-${id}`,
                  checked: selectedFeatures.includes(id),
                  onCheckedChange: (checked) => {
                    setSelectedFeatures((current) =>
                      checked ? [...current, id] : current.filter((featureId) => featureId !== id),
                    );
                  },
                })}
              />

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <div className="mb-3 text-sm font-medium text-slate-700">Selected values</div>
                <div className="flex flex-wrap gap-2">
                  {selectedFeatures.length > 0 ? (
                    selectedFeatures.map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-700"
                      >
                        {feature}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No filters selected</span>
                  )}
                </div>
              </div>
            </div>
          </PreviewCard>
        </div>
      </div>
    </main>
  );
}

export default function PreviewPage() {
  return (
    <NuqsAdapter>
      <Suspense fallback={<main className="min-h-screen bg-white" />}>
        <PreviewContent />
      </Suspense>
    </NuqsAdapter>
  );
}
