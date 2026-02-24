# Jurisdiction Feature Flags

## Overview
Jurisdiction feature flags control which features are enabled per jurisdiction. Flags are stored in the database and associated to jurisdictions (many-to-many). Backend code and frontend rely on the same canonical list of flag names.

## Source of truth
- Canonical list and descriptions: [api/src/enums/feature-flags/feature-flags-enum.ts](api/src/enums/feature-flags/feature-flags-enum.ts#L1-L200)
- DB model & operations: [api/src/services/feature-flag.service.ts](api/src/services/feature-flag.service.ts#L1-L200)
- Jurisdiction DTO (where `featureFlags` is exposed): [api/src/dtos/jurisdictions/jurisdiction.dto.ts](api/src/dtos/jurisdictions/jurisdiction.dto.ts#L1-L200)
- Utilities to check flags in code: [api/src/utilities/feature-flag-utilities.ts](api/src/utilities/feature-flag-utilities.ts#L1-L200)
- Scripted initial flags (dev): [api/src/services/script-runner.service.ts](api/src/services/script-runner.service.ts#L1250-L1310)

## How flags are represented
- DB table: `featureFlags` (fields: `name`, `description`, `active`, relations to jurisdictions).
- DTO: `FeatureFlag` includes `name`, `description`, `active`, and `jurisdictions`.
- Feature names are strings (also enumerated by `FeatureFlagEnum` for convenience).

## How to add a new feature flag (recommended steps)
1. Add the new flag name to `FeatureFlagEnum` and to `featureFlagMap` with a helpful description in [api/src/enums/feature-flags/feature-flags-enum.ts](api/src/enums/feature-flags/feature-flags-enum.ts#L1-L200).
2. Persist the new flag into the DB by running the "add new flags" API or using the script-runner:
   - API endpoint: `POST /featureFlags/addAllNew` (controller: [api/src/controllers/feature-flag.controller.ts](api/src/controllers/feature-flag.controller.ts#L1-L200)). This inserts any flags from the enum/map not already present. Note: this endpoint is protected by the API guards; supply appropriate auth/API key in requests.
   - Or use existing dev seed / script-runner which contains a `featureFlags` array: [api/src/services/script-runner.service.ts](api/src/services/script-runner.service.ts#L1250-L1310).
3. Optionally update any frontend usage to reference the new flag name.

## How to associate a flag with jurisdictions
- Endpoint: `PUT /featureFlags/associateJurisdictions` (controller: [api/src/controllers/feature-flag.controller.ts](api/src/controllers/feature-flag.controller.ts#L1-L200)).
- Payload shape (example):

```json
{
  "id": "<featureFlagId>",
  "associate": ["<jurisdictionId1>", "<jurisdictionId2>"],
  "remove": ["<jurisdictionId3>"]
}
```

- Example curl (replace host, auth, and ids):

```bash
curl -X PUT "http://localhost:3100/featureFlags/associateJurisdictions" \
  -H "Content-Type: application/json" \
  -H "Authorization: ApiKey <YOUR_API_KEY>" \
  -d '{"id":"abcd-ef01-2345-6789","associate":["jur-1"],"remove":[]}'
```

## How code checks flags
Use the utility helpers located at [api/src/utilities/feature-flag-utilities.ts](api/src/utilities/feature-flag-utilities.ts#L1-L200):
- `doJurisdictionHaveFeatureFlagSet(jurisdiction, FeatureFlagEnum.myFlag)` — check a single jurisdiction.
- `doAnyJurisdictionHaveFeatureFlagSet(jurisdictions, FeatureFlagEnum.myFlag)` — checks any in a list.

Example usage in code:

```ts
import { FeatureFlagEnum } from '../enums/feature-flags/feature-flags-enum';
import { doJurisdictionHaveFeatureFlagSet } from '../utilities/feature-flag-utilities';

const enabled = doJurisdictionHaveFeatureFlagSet(jurisdiction, FeatureFlagEnum.enableUnitGroups);
if (enabled) {
  // use unit groups logic
}
```

## How flags appear in API responses
When retrieving jurisdictions, `featureFlags` are included by default via service include settings:
- See: [api/src/services/jurisdiction.service.ts](api/src/services/jurisdiction.service.ts#L1-L200)

The `featureFlags` field in the `Jurisdiction` DTO is an array of `FeatureFlag` objects: [api/src/dtos/feature-flags/feature-flag.dto.ts](api/src/dtos/feature-flags/feature-flag.dto.ts#L1-L200).

## Notes & gotchas
- Keep `featureFlagMap` and `FeatureFlagEnum` in sync — the codebase uses the enum/map as the canonical list and descriptions.
- The `addAllNewFeatureFlags` method sets created flags to `active: true` by default (see [api/src/services/feature-flag.service.ts](api/src/services/feature-flag.service.ts#L1-L200)).
- There are seeded/dev lists in `script-runner` that may contain typos (compare names against the enum).

## Quick links
- Feature flag definitions: [api/src/enums/feature-flags/feature-flags-enum.ts](api/src/enums/feature-flags/feature-flags-enum.ts#L1-L200)
- Feature flag API: [api/src/controllers/feature-flag.controller.ts](api/src/controllers/feature-flag.controller.ts#L1-L200)
- Service operations: [api/src/services/feature-flag.service.ts](api/src/services/feature-flag.service.ts#L1-L200)
- Jurisdiction DTO: [api/src/dtos/jurisdictions/jurisdiction.dto.ts](api/src/dtos/jurisdictions/jurisdiction.dto.ts#L1-L200)
- Utilities: [api/src/utilities/feature-flag-utilities.ts](api/src/utilities/feature-flag-utilities.ts#L1-L200)

---

If you want, I can:
- Add this file to the repo (done),
- Open a PR for it, or
- Add a short section to the developer README with a one-line reference to this doc.
