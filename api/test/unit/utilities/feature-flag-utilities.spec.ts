import { Jurisdiction } from '../../../src/dtos/jurisdictions/jurisdiction.dto';
import { FeatureFlagEnum } from '../../../src/enums/feature-flags/feature-flags-enum';
import { doJurisdictionHaveFeatureFlagSet } from '../../../src/utilities/feature-flag-utilities';

const stubJurisdiction: Jurisdiction = {
  name: 'foo',
  languages: [],
  multiselectQuestions: [],
  publicUrl: '',
  emailFromAddress: '',
  rentalAssistanceDefault: '',
  whatToExpect: '',
  whatToExpectAdditionalText: '',
  whatToExpectUnderConstruction: '',
  allowSingleUseCodeLogin: false,
  listingApprovalPermissions: [],
  duplicateListingPermissions: [],
  featureFlags: [],
  requiredListingFields: [],
  visibleNeighborhoodAmenities: [],
  regions: [],
  id: '',
  createdAt: undefined,
  updatedAt: undefined,
};

describe('testing doJurisdictionHaveFeatureFlagSet', () => {
  it('should return correctly for unset flag', () => {
    expect(
      doJurisdictionHaveFeatureFlagSet(
        stubJurisdiction,
        FeatureFlagEnum.disableWorkInRegion,
      ),
    ).toEqual(false);
  });

  it('should return correctly for disableListingPreferences', () => {
    expect(
      doJurisdictionHaveFeatureFlagSet(
        stubJurisdiction,
        FeatureFlagEnum.disableListingPreferences,
      ),
    ).toEqual(true);
  });

  it('should return correctly for disableBuildingSelectionCriteria', () => {
    expect(
      doJurisdictionHaveFeatureFlagSet(
        stubJurisdiction,
        FeatureFlagEnum.disableBuildingSelectionCriteria,
      ),
    ).toEqual(true);
  });
});
