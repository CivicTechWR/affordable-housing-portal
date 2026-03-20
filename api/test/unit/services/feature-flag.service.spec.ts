import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { FeatureFlagCreate } from '../../../src/dtos/feature-flags/feature-flag-create.dto';
import { FeatureFlagUpdate } from '../../../src/dtos/feature-flags/feature-flag-update.dto';
import { FeatureFlagService } from '../../../src/services/feature-flag.service';
import { PrismaService } from '../../../src/services/prisma.service';

describe('Testing feature flag service', () => {
  let service: FeatureFlagService;
  let prisma: PrismaService;

  const mockFeatureFlag = (position: number, date: Date, active = true) => {
    return {
      id: randomUUID(),
      createdAt: date,
      updatedAt: date,
      name: `feature flag ${position}`,
      description: `feature flag description ${position}`,
      active: active,
    };
  };

  const mockFeatureFlagSet = (numberToCreate: number, date: Date) => {
    const toReturn = [];
    for (let i = 0; i < numberToCreate; i++) {
      toReturn.push(mockFeatureFlag(i, date));
    }
    return toReturn;
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeatureFlagService, PrismaService, Logger],
    }).compile();

    service = module.get<FeatureFlagService>(FeatureFlagService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('Testing list()', () => {
    it('should return list of feature flags', async () => {
      const date = new Date();
      const mockedValue = mockFeatureFlagSet(3, date);
      prisma.featureFlags.findMany = jest.fn().mockResolvedValue(mockedValue);

      expect(await service.list()).toEqual(mockedValue);

      expect(prisma.featureFlags.findMany).toHaveBeenCalledWith();
    });
  });

  describe('Testing findOne()', () => {
    it('should find and return one feature flag', async () => {
      const date = new Date();
      const mockedValue = mockFeatureFlag(1, date);
      prisma.featureFlags.findFirst = jest.fn().mockResolvedValue(mockedValue);

      expect(await service.findOne(mockedValue.id)).toEqual(mockedValue);

      expect(prisma.featureFlags.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockedValue.id,
        },
      });
    });

    it('should not find a feature flag and throw error', async () => {
      prisma.featureFlags.findFirst = jest.fn().mockResolvedValue(null);

      await expect(
        async () => await service.findOne('example Id'),
      ).rejects.toThrowError(
        'feature flag id example Id was requested but not found',
      );

      expect(prisma.featureFlags.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'example Id',
        },
      });
    });
  });

  describe('Testing create()', () => {
    it('should create a new feature flag record', async () => {
      const date = new Date();
      const mockedValue = mockFeatureFlag(1, date);
      prisma.featureFlags.create = jest.fn().mockResolvedValue(mockedValue);

      const params: FeatureFlagCreate = {
        name: mockedValue.name,
        description: mockedValue.description,
        active: mockedValue.active,
      };

      expect(await service.create(params)).toEqual(mockedValue);

      expect(prisma.featureFlags.create).toHaveBeenCalledWith({
        data: {
          name: mockedValue.name,
          description: mockedValue.description,
          active: mockedValue.active,
        },
      });
    });
  });

  describe('Testing update()', () => {
    it('should update existing feature flag record', async () => {
      const date = new Date();

      const mockedValue = mockFeatureFlag(1, date);

      prisma.featureFlags.findFirst = jest.fn().mockResolvedValue(mockedValue);
      prisma.featureFlags.update = jest.fn().mockResolvedValue({
        ...mockedValue,
        description: 'updated feature flag 1',
      });

      const params: FeatureFlagUpdate = {
        id: mockedValue.id,
        description: 'updated feature flag 1',
        active: mockedValue.active,
      };

      expect(await service.update(params)).toEqual({
        id: mockedValue.id,
        name: mockedValue.name,
        description: 'updated feature flag 1',
        active: mockedValue.active,
        createdAt: date,
        updatedAt: date,
      });

      expect(prisma.featureFlags.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockedValue.id,
        },
      });

      expect(prisma.featureFlags.update).toHaveBeenCalledWith({
        data: {
          description: 'updated feature flag 1',
          active: mockedValue.active,
        },
        where: {
          id: mockedValue.id,
        },
      });
    });

    it('should not find a feature flag and throw error', async () => {
      prisma.featureFlags.findFirst = jest.fn().mockResolvedValue(null);
      prisma.featureFlags.update = jest.fn().mockResolvedValue(null);

      const params: FeatureFlagUpdate = {
        id: 'example id',
        description: 'example description',
        active: true,
      };

      await expect(
        async () => await service.update(params),
      ).rejects.toThrowError(
        'feature flag id example id was requested but not found',
      );

      expect(prisma.featureFlags.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'example id',
        },
      });
    });
  });

  describe('Testing delete()', () => {
    it('should delete feature flag record', async () => {
      const date = new Date();
      const mockedValue = mockFeatureFlag(1, date);

      prisma.featureFlags.findFirst = jest.fn().mockResolvedValue(mockedValue);
      prisma.featureFlags.delete = jest.fn().mockResolvedValue(mockedValue);

      expect(await service.delete(mockedValue.id)).toEqual({
        success: true,
      });

      expect(prisma.featureFlags.delete).toHaveBeenCalledWith({
        where: {
          id: mockedValue.id,
        },
      });

      expect(prisma.featureFlags.delete).toHaveBeenCalledWith({
        where: {
          id: mockedValue.id,
        },
      });
    });
  });
});
