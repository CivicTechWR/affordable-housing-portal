import { randomUUID } from 'crypto';
import { Prisma, PrismaClient } from '@prisma/client';
import { randomBoolean } from './boolean-generator';
import { randomAdjective } from './word-generator';
import { featureFlagMap } from '../../src/enums/feature-flags/feature-flags-enum';

export const createAllFeatureFlags = async (prismaClient: PrismaClient) => {
  await prismaClient.featureFlags.createMany({
    data: featureFlagMap.map((flag) => {
      return { ...flag, active: true };
    }),
    skipDuplicates: true,
  });
};

export const featureFlagFactory = (
  name = `feature-flag-${randomUUID()}`,
  active = randomBoolean(),
  description = `${randomAdjective()} feature flag`,
): Prisma.FeatureFlagsCreateInput => ({
  name: name,
  description: description,
  active: active,
});
