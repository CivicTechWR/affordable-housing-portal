import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CustomListingFeature } from '../dtos/custom-listing-features/custom-listing-feature.dto';
import { CustomListingFeatureCreate } from '../dtos/custom-listing-features/custom-listing-feature-create.dto';
import { CustomListingFeatureUpdate } from '../dtos/custom-listing-features/custom-listing-feature-update.dto';
import { mapTo } from '../utilities/mapTo';
import { SuccessDTO } from '../dtos/shared/success.dto';
import { CustomListingFeatures } from '@prisma/client';

/*
  this is the service for custom listing features
  it handles all the backend's business logic for reading/writing/deleting custom listing feature data
*/

@Injectable()
export class CustomListingFeatureService {
  constructor(private prisma: PrismaService) { }

  /*
      this will get a set of custom listing features given the params passed in
    */
  async list(): Promise<CustomListingFeature[]> {
    const rawFeatures = await this.prisma.customListingFeatures.findMany();
    return mapTo(CustomListingFeature, rawFeatures);
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
