import { FeatureFlag } from '../dtos/feature-flags/feature-flag.dto';
import { FeatureFlagEnum } from '../enums/feature-flags/feature-flags-enum';

export const isFeatureFlagActive = (
  featureFlags: FeatureFlag[],
  featureFlagName: FeatureFlagEnum,
): boolean => {
  return (
    featureFlags?.some(
      (flag) => flag.name === featureFlagName && flag.active,
    ) ?? false
  );
};
