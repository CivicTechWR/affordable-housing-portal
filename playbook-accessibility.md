# Playbook: Enabling Accessibility Form and Filters

This guide explains how to enable the accessibility form for adding/editing a listing in the Partners portal, and how to display the corresponding accessibility filters on the Public portal's listing browser.

Both of these features are controlled by **Jurisdiction settings** in the Bloom backend database.

## Prerequisites

To turn on these features, you will need to modify the `Jurisdiction` record in the database. This is typically done either through a direct database update or by updating seed files if you are configuring a fresh instance.

There are two missing pieces that must be configured:
1. The `enableAccessibilityFeatures` feature flag must be enabled.
2. The `listingFeaturesConfiguration` field must be populated with a valid JSON configuration.

> [!NOTE]
> Currently, there is **no graphical user interface (UI)** in the Partners or Admin portal to edit these Jurisdiction settings. All changes to feature flags and the JSON configuration must be done directly via database updates or seeding scripts.
>
> While there are `PUT` and `POST` endpoints available for Jurisdictions on the backend API, the frontend applications do not currently expose tables or forms to interact with them for these settings.

---

## Step 1: Enable the Feature Flag

In the `jurisdictions` table, ensure the feature flags collection includes the exact string for the accessibility features flag. 

**Flag Name:** `enableAccessibilityFeatures`

*(Note: Depending on how your database handles feature flags, this may be a related table or a string array. In standard Bloom setups, it is usually managed via the `jurisdictions.featureFlags` relation.)*

## Step 2: Define the `listingFeaturesConfiguration` JSON

The frontend looks for specific categories or a flat list of configurable features in the jurisdiction's `listingFeaturesConfiguration` property. 

You must update the `listingFeaturesConfiguration` column in the `jurisdictions` table with a valid JSON object. 

### Option A: Flat List Configuration
Provides a single, uncategorized checklist of accessibility features.

```json
{
  "fields": [
    { "id": "wheelchairRamp" },
    { "id": "elevator" },
    { "id": "serviceAnimalsAllowed" },
    { "id": "accessibleParking" },
    { "id": "parkingOnSite" },
    { "id": "inUnitWasherDryer" },
    { "id": "barrierFreeEntrance" },
    { "id": "rollInShower" },
    { "id": "grabBars" },
    { "id": "hearing" },
    { "id": "mobility" },
    { "id": "visual" }
  ]
}
```

### Option B: Categorized Configuration
Groups accessibility features into specific categories. This is the recommended approach for extensive configurations.

```json
{
  "categories": [
    {
      "id": "mobility",
      "fields": [
        { "id": "accessibleParking" },
        { "id": "barrierFreePropertyEntrance" },
        { "id": "barrierFreeUnitEntrance" },
        { "id": "elevator" },
        { "id": "wheelchairRamp" }
      ]
    },
    {
      "id": "bathroom",
      "fields": [
        { "id": "accessibleHeightToilet" },
        { "id": "barrierFreeBathroom" },
        { "id": "rollInShower" },
        { "id": "walkInShower" }
      ]
    },
    {
      "id": "flooring",
      "fields": [
        { "id": "carpetInUnit" }, 
        { "id": "hardFlooringInUnit" }
      ],
      "required": false
    }
  ]
}
```

> [!IMPORTANT]  
> The `id` values provided in the JSON configuration MUST correspond exactly to the column names defined in the `ListingFeatures` model in your database schema (e.g., `wheelchairRamp`, `elevator`, `serviceAnimalsAllowed`). 
> 
> Furthermore, they must also correspond exactly to the translation strings defined in your frontend locales (e.g., `eligibility.accessibility.wheelchairRamp`). 
> 
> **To introduce custom accessibility features, you must first add the new column to the `ListingFeatures` Prisma model, run database migrations, and add the corresponding translations.**

## Step 3: Verify the Changes

1. **Partners App:** Go to **Add a Listing** or edit an existing one. Look for the "Accessibility features" section within the "Listing Details" tab. It should now be visible and interactive.
2. **Public App:** Go to the Listings page (`/listings`). Open the Filter drawer. You should see a new "Accessibility features" checklist filter group containing the items you configured in Step 2.
