#!/bin/bash
# =============================================================================
# Bulk create GitHub issues for the Affordable Housing Portal cleanup
# Usage: ./create-github-issues.sh
#
# Prerequisites:
#   - GitHub CLI (gh) installed and authenticated: `gh auth login`
#   - Run from the repo root: /Users/jess/affordable-housing-portal
#
# This script will:
#   1. Create two labels for the user flows (if they don't exist)
#   2. Create all issues with the appropriate label
# =============================================================================

set -e

REPO="CivicTechWR/affordable-housing-portal"

echo "📋 Creating labels..."
gh label create "flow: housing providers create listing" --color "1D76DB" --description "Features related to the listing creation flow for housing providers" --repo "$REPO" 2>/dev/null || echo "  Label already exists, skipping."
gh label create "flow: housing searcher browsing" --color "0E8A16" --description "Features related to the public browsing flow for social workers" --repo "$REPO" 2>/dev/null || echo "  Label already exists, skipping."
gh label create "cleanup" --color "D93F0B" --description "Removal of obsolete affordable housing program features" --repo "$REPO" 2>/dev/null || echo "  Label already exists, skipping."

echo ""
echo "=========================================="
echo "🏗️  Housing Providers Can Create a Listing"
echo "=========================================="

gh issue create --repo "$REPO" \
  --title "Remove AMI Configuration Steps" \
  --label "flow: housing providers create listing,cleanup" \
  --body "Remove the Area Median Income (AMI) configuration from the listing creation form in the Partners portal. This includes the AMI chart selector and percentage inputs on individual units and unit groups.

## Tests to update
- Delete \`ami-chart.service.spec.ts\` and \`ami-chart.controller.spec.ts\`
- Update listing creation e2e tests to remove AMI steps
- Update unit/unit-group test fixtures that reference AMI data"

gh issue create --repo "$REPO" \
  --title "Remove AMI Chart Prisma Models" \
  --label "flow: housing providers create listing,cleanup" \
  --body "Remove \`AmiChart\` model and disconnect \`UnitGroupAmiLevels\` references from \`schema.prisma\`. Create a database migration. Note: \`Units.amiChartId\` is optional so this won't break unit creation.

## Tests to update
- Remove AMI chart seed data and test fixtures
- Update unit creation tests that reference AMI charts"

gh issue create --repo "$REPO" \
  --title "Remove Lottery Configuration" \
  --label "flow: housing providers create listing,cleanup" \
  --body "Remove the lottery toggle, lottery opt-in, and all lottery status/configuration fields from the listing creation form in the Partners portal.

## Tests to update
- Delete \`lottery.service.spec.ts\` and \`lottery.controller.spec.ts\`
- Update listing creation e2e tests to remove lottery steps
- Remove lottery status assertions from listing detail tests"

gh issue create --repo "$REPO" \
  --title "Remove Lottery Prisma Models" \
  --label "flow: housing providers create listing,cleanup" \
  --body "Remove lottery-related Prisma models: \`ApplicationLotteryPositions\`, \`ApplicationLotteryTotal\`, and lottery status columns from the \`Listings\` model. Create a database migration.

## Tests to update
- Remove lottery-related seed data and test fixtures"

gh issue create --repo "$REPO" \
  --title "Remove Application Types Configuration" \
  --label "flow: housing providers create listing,cleanup" \
  --body "Remove the Application Types step from the listing creation form (digital application toggle, paper application upload, common digital application, application methods).

## Tests to update
- Update listing creation e2e tests to skip application type configuration
- Remove application method test fixtures"

gh issue create --repo "$REPO" \
  --title "Remove Waitlist Configuration" \
  --label "flow: housing providers create listing,cleanup" \
  --body "Remove waitlist-related fields from the listing creation form: waitlist open toggle, waitlist max size, waitlist current size, display waitlist size, and waitlist open spots.

## Tests to update
- Update listing service tests to remove waitlist field assertions
- Update listing creation e2e tests"

gh issue create --repo "$REPO" \
  --title "Remove Application Processing Tab" \
  --label "flow: housing providers create listing,cleanup" \
  --body "Delete the application review interface under \`sites/partners/src/pages/application/\` and remove the Applications tab from individual listing management views.

## Tests to update
- Delete application review Cypress tests
- Remove application tab navigation assertions from listing detail tests"

gh issue create --repo "$REPO" \
  --title "Remove Export Applications" \
  --label "flow: housing providers create listing,cleanup" \
  --body "Delete the CSV export functionality for applications from the Partners portal.

## Tests to update
- Delete \`application-exporter.service.spec.ts\`
- Remove export button assertions from e2e tests"

gh issue create --repo "$REPO" \
  --title "Remove Duplicate Application Detection" \
  --label "flow: housing providers create listing,cleanup" \
  --body "Delete the \`application-flagged-set\` module which automatically scans for duplicate applicant names and emails. Remove \`ApplicationFlaggedSet\` Prisma models and create a database migration.

## Tests to update
- Delete \`application-flagged-set.service.spec.ts\` and related integration tests"

gh issue create --repo "$REPO" \
  --title "Remove Section 8 Acceptance Field" \
  --label "flow: housing providers create listing,cleanup" \
  --body "Remove the Section 8 acceptance toggle from the listing form. This is a US-specific program reference not relevant to the Waterloo Region.

## Tests to update
- Remove \`section8Acceptance\` from listing test fixtures and assertions"

gh issue create --repo "$REPO" \
  --title "Remove HUD/EBLL Clearance Field" \
  --label "flow: housing providers create listing,cleanup" \
  --body "Remove the HUD EBLL clearance toggle from the listing form. This is a US-specific federal compliance field.

## Tests to update
- Remove \`hasHudEbllClearance\` from listing test fixtures and assertions"

gh issue create --repo "$REPO" \
  --title "Remove COC Info Field" \
  --label "flow: housing providers create listing,cleanup" \
  --body "Remove the Continuum of Care (COC) info field from the listing form. This is a US-specific homelessness program reference.

## Tests to update
- Remove \`cocInfo\` from listing test fixtures and assertions"

gh issue create --repo "$REPO" \
  --title "Remove Building Selection Criteria" \
  --label "flow: housing providers create listing,cleanup" \
  --body "Remove the building selection criteria text and file upload from the listing form. This was used for US affordable housing program compliance documents.

## Tests to update
- Remove \`buildingSelectionCriteria\` from listing test fixtures"

gh issue create --repo "$REPO" \
  --title "Remove Program Rules Field" \
  --label "flow: housing providers create listing,cleanup" \
  --body "Remove the program rules text field from the listing form. This was used to describe US affordable housing program eligibility rules.

## Tests to update
- Remove \`programRules\` from listing test fixtures"

echo ""
echo "=========================================="
echo "🔍 Housing Searcher Browsing"
echo "=========================================="

gh issue create --repo "$REPO" \
  --title "Remove Application Submission Wizard" \
  --label "flow: housing searcher browsing,cleanup" \
  --body "Delete the entire multi-step application wizard under \`sites/public/src/pages/applications/\`. This removes the forms collecting income, household size, demographics, SSN, and other applicant data.

## Tests to update
- Delete all Cypress e2e tests for the public application flow
- Delete application-related React component unit tests
- Remove application form test fixtures and mock data"

gh issue create --repo "$REPO" \
  --title "Remove Apply Online Buttons" \
  --label "flow: housing searcher browsing,cleanup" \
  --body "Strip out the 'Apply Online' CTA buttons and related apply flow from individual listing detail pages on the public portal.

## Tests to update
- Update listing detail page e2e tests to remove apply button assertions
- Update listing detail component tests"

gh issue create --repo "$REPO" \
  --title "Remove My Applications Tracking" \
  --label "flow: housing searcher browsing,cleanup" \
  --body "Delete the 'My Applications' view from the user account portal (\`sites/public/src/pages/account/applications.tsx\`) so social workers no longer see an empty application tracker.

## Tests to update
- Delete My Applications page tests
- Update account navigation tests to remove applications link"

gh issue create --repo "$REPO" \
  --title "Remove Lottery Status Badges" \
  --label "flow: housing searcher browsing,cleanup" \
  --body "Remove timeline states and status badges related to lotteries (e.g. 'Waitlist Closed', 'Lottery Results') from listing cards and detail pages that are driven by internal application logic.

## Tests to update
- Update listing card component tests to remove lottery status assertions
- Update listing detail e2e tests"

gh issue create --repo "$REPO" \
  --title "Remove Application Backend Services and Endpoints" \
  --label "flow: housing searcher browsing,cleanup" \
  --body "Remove backend API controllers and services that handle creating new applications from the public frontend, and endpoints that fetch a user's submitted applications. Delete \`application.module.ts\`, \`application-exporter.module.ts\`, and related controllers/services.

## Tests to update
- Delete \`application.controller.spec.ts\` and \`application.service.spec.ts\`
- Delete application-related integration/e2e tests in \`api/test/\`"

gh issue create --repo "$REPO" \
  --title "Remove Application Prisma Models and Seeders" \
  --label "flow: housing searcher browsing,cleanup" \
  --body "Remove the \`Application\`, \`ApplicationSnapshot\`, \`Applicant\`, \`ApplicantSnapshot\`, \`AlternateContact\`, \`AlternateContactSnapshot\`, \`HouseholdMember\`, \`Accessibility\`, and related join-table Prisma models from \`schema.prisma\`. Create a database migration. Also remove all database seeders that generate fake application and applicant data.

## Tests to update
- Update prisma seed scripts and test database setup
- Remove application-related test fixtures across all test suites"

echo ""
echo "✅ All issues created successfully!"
echo "View them at: https://github.com/$REPO/issues"
