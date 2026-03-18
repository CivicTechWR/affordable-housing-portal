import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../src/services/prisma.service';
import { CustomFeatureService } from '../../../src/services/custom-feature.service';
import { CustomListingFeatureCreate } from '../../../src/dtos/custom-listing-features/custom-listing-feature-create.dto';
import { CustomListingFeatureUpdate } from '../../../src/dtos/custom-listing-features/custom-listing-feature-update.dto';
import { CustomFeatureAssociate } from '../../../src/dtos/custom-listing-features/custom-feature-associate.dto';
import { randomUUID } from 'crypto';
import { CustomListingScope } from '@prisma/client';

describe('Testing custom feature service', () => {
  let service: CustomFeatureService;
  let prisma: PrismaService;

  const mockCustomFeature = (date: Date, override = {}) => {
    return {
      id: randomUUID(),
      createdAt: date,
      updatedAt: date,
      displayName: 'Feature 1',
      key: 'feature-1',
      category: 'Category A',
      scope: CustomListingScope.PROPERTY,
      ...override,
    };
  };

  const mockCustomFeatureSet = (numberToCreate: number, date: Date) => {
    const toReturn = [];
    for (let i = 0; i < numberToCreate; i++) {
      toReturn.push(
        mockCustomFeature(date, {
          displayName: `Feature ${i}`,
          key: `feature-${i}`,
        }),
      );
    }
    return toReturn;
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomFeatureService, PrismaService],
    }).compile();

    service = module.get<CustomFeatureService>(CustomFeatureService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('testing list()', async () => {
    const date = new Date();
    const mockedValue = mockCustomFeatureSet(3, date);
    prisma.customListingFeatures.findMany = jest
      .fn()
      .mockResolvedValue(mockedValue);

    expect(await service.list()).toEqual([
      { ...mockedValue[0] },
      { ...mockedValue[1] },
      { ...mockedValue[2] },
    ]);

    expect(prisma.customListingFeatures.findMany).toHaveBeenCalled();
  });

  it('testing findOne() with id present', async () => {
    const date = new Date();
    const mockedValue = mockCustomFeature(date);
    prisma.customListingFeatures.findUnique = jest
      .fn()
      .mockResolvedValue(mockedValue);

    expect(await service.findOne('example Id')).toEqual(mockedValue);

    expect(prisma.customListingFeatures.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'example Id',
      },
    });
  });

  it('testing findOne() with id not present', async () => {
    prisma.customListingFeatures.findUnique = jest.fn().mockResolvedValue(null);

    await expect(
      async () => await service.findOne('example Id'),
    ).rejects.toThrowError();

    expect(prisma.customListingFeatures.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'example Id',
      },
    });
  });

  it('testing create()', async () => {
    const date = new Date();
    const mockCreated = {
      displayName: 'Feature 1',
      key: 'feature-1',
      category: 'Category A',
      scope: CustomListingScope.PROPERTY,
    };
    const mockedValue = mockCustomFeature(date, mockCreated);
    prisma.customListingFeatures.create = jest
      .fn()
      .mockResolvedValue(mockedValue);

    const params: CustomListingFeatureCreate = {
      ...mockCreated,
    };

    expect(await service.create(params)).toEqual(mockedValue);

    expect(prisma.customListingFeatures.create).toHaveBeenCalledWith({
      data: {
        ...mockCreated,
      },
    });
  });

  it('testing update() existing record found', async () => {
    const date = new Date();
    const mockedCustomFeature = mockCustomFeature(date);

    prisma.customListingFeatures.findUnique = jest
      .fn()
      .mockResolvedValue(mockedCustomFeature);
    prisma.customListingFeatures.update = jest.fn().mockResolvedValue({
      ...mockedCustomFeature,
      displayName: 'Updated Feature',
    });

    const params: CustomListingFeatureUpdate = {
      id: mockedCustomFeature.id,
      displayName: 'Updated Feature',
      key: 'feature-1',
      category: 'Category A',
      scope: CustomListingScope.PROPERTY,
    };

    expect(await service.update(params)).toEqual({
      id: mockedCustomFeature.id,
      displayName: 'Updated Feature',
      key: 'feature-1',
      category: 'Category A',
      scope: CustomListingScope.PROPERTY,
      createdAt: date,
      updatedAt: date,
    });

    expect(prisma.customListingFeatures.findUnique).toHaveBeenCalledWith({
      where: {
        id: mockedCustomFeature.id,
      },
    });

    expect(prisma.customListingFeatures.update).toHaveBeenCalledWith({
      data: {
        displayName: 'Updated Feature',
        key: 'feature-1',
        category: 'Category A',
        scope: CustomListingScope.PROPERTY,
      },
      where: {
        id: mockedCustomFeature.id,
      },
    });
  });

  it('testing update() existing record not found', async () => {
    prisma.customListingFeatures.findUnique = jest.fn().mockResolvedValue(null);
    prisma.customListingFeatures.update = jest.fn().mockResolvedValue(null);

    const params: CustomListingFeatureUpdate = {
      id: 'example id',
      displayName: 'Updated Feature',
      key: 'feature-1',
      category: 'Category A',
      scope: CustomListingScope.PROPERTY,
    };

    await expect(
      async () => await service.update(params),
    ).rejects.toThrowError();

    expect(prisma.customListingFeatures.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'example id',
      },
    });
  });

  it('testing delete()', async () => {
    const date = new Date();
    const mockedValue = mockCustomFeature(date);
    prisma.customListingFeatures.findUnique = jest
      .fn()
      .mockResolvedValue(mockedValue);
    prisma.customListingFeatures.delete = jest
      .fn()
      .mockResolvedValue(mockedValue);

    expect(await service.delete('example Id')).toEqual({
      success: true,
    });

    expect(prisma.customListingFeatures.delete).toHaveBeenCalledWith({
      where: {
        id: 'example Id',
      },
    });
  });

  it('testing findOrThrow() record not found', async () => {
    prisma.customListingFeatures.findUnique = jest.fn().mockResolvedValue(null);

    await expect(
      async () => await service.findOrThrow('example id'),
    ).rejects.toThrowError();

    expect(prisma.customListingFeatures.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'example id',
      },
    });
  });

  it('testing findOrThrow() record found', async () => {
    const date = new Date();
    const mockedValue = mockCustomFeature(date);
    prisma.customListingFeatures.findUnique = jest
      .fn()
      .mockResolvedValue(mockedValue);

    expect(await service.findOrThrow('example id')).toEqual(mockedValue);

    expect(prisma.customListingFeatures.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'example id',
      },
    });
  });
});
