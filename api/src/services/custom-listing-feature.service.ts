import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CustomListingFeature } from '../dtos/custom-listing-features/custom-listing-feature.dto';
import { CustomListingFeatureCategory } from '../dtos/custom-listing-features/custom-listing-feature-category.dto';
import { CustomListingFeatureCreate } from '../dtos/custom-listing-features/custom-listing-feature-create.dto';
import { CustomListingFeatureUpdate } from '../dtos/custom-listing-features/custom-listing-feature-update.dto';
import { mapTo } from '../utilities/mapTo';
import { SuccessDTO } from '../dtos/shared/success.dto';
import { CustomListingFeatures, CustomListingScope } from '@prisma/client';

/*
  this is the service for custom listing features
  it handles all the backend's business logic for reading/writing/deleting custom listing feature data
*/

@Injectable()
export class CustomListingFeatureService {
  constructor(private prisma: PrismaService) { }

  /*
      this will return all custom listing features for a given scope,
      grouped by category
    */
  async findCategorizedByScope(
    scope: CustomListingScope,
  ): Promise<CustomListingFeatureCategory[]> {
    const rawFeatures = await this.prisma.customListingFeatures.findMany({
      where: { scope },
      orderBy: { category: 'asc' },
    });

    const categoryMap = new Map<string, CustomListingFeatures[]>();
    for (const feature of rawFeatures) {
      const existing = categoryMap.get(feature.category) ?? [];
      existing.push(feature);
      categoryMap.set(feature.category, existing);
    }

    return Array.from(categoryMap.entries()).map(([name, features]) =>
      mapTo(CustomListingFeatureCategory, {
        name,
        features: features.map((f) => mapTo(CustomListingFeature, f)),
      }),
    );
  }


  /*
      this will return 1 custom listing feature or error
    */
  async findOne(customListingFeatureId: string): Promise<CustomListingFeature> {
    const rawFeature = await this.findOrThrow(customListingFeatureId);

    return mapTo(CustomListingFeature, rawFeature);
  }

  /*
      this will create a custom listing feature
    */
  async create(
    incomingData: CustomListingFeatureCreate,
  ): Promise<CustomListingFeature> {
    const rawResult = await this.prisma.customListingFeatures.create({
      data: {
        ...incomingData,
        id: undefined,
      },
    });

    return mapTo(CustomListingFeature, rawResult);
  }

  /*
      this will update a custom listing feature
      if no custom listing feature has the id of the incoming argument an error is thrown
    */
  async update(
    incomingData: CustomListingFeatureUpdate,
  ): Promise<CustomListingFeature> {
    await this.findOrThrow(incomingData.id);

    const rawResults = await this.prisma.customListingFeatures.update({
      data: {
        category: incomingData.category,
        displayName: incomingData.displayName,
        key: incomingData.key,
        scope: incomingData.scope,
      },
      where: {
        id: incomingData.id,
      },
    });
    return mapTo(CustomListingFeature, rawResults);
  }

  /*
      this will delete a custom listing feature
    */
  async delete(customListingFeatureId: string): Promise<SuccessDTO> {
    await this.findOrThrow(customListingFeatureId);
    await this.prisma.customListingFeatures.delete({
      where: {
        id: customListingFeatureId,
      },
    });
    return {
      success: true,
    } as SuccessDTO;
  }

  /*
      this will either find a record or throw a customized error
    */
  async findOrThrow(
    customListingFeatureId: string,
  ): Promise<CustomListingFeatures> {
    const feature = await this.prisma.customListingFeatures.findUnique({
      where: {
        id: customListingFeatureId,
      },
    });

    if (!feature) {
      throw new NotFoundException(
        `customListingFeatureId ${customListingFeatureId} was requested but not found`,
      );
    }

    return feature;
  }
}
