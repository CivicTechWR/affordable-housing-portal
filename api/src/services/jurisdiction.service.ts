import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Jurisdiction } from '../dtos/jurisdictions/jurisdiction.dto';
import { JurisdictionCreate } from '../dtos/jurisdictions/jurisdiction-create.dto';
import { mapTo } from '../utilities/mapTo';
import { SuccessDTO } from '../dtos/shared/success.dto';
import { Prisma } from '@prisma/client';
import { JurisdictionUpdate } from '../dtos/jurisdictions/jurisdiction-update.dto';

const view: Prisma.JurisdictionsInclude = {
  multiselectQuestions: true,
};
/**
  this is the service for jurisdictions
  it handles all the backend's business logic for reading/writing/deleting jurisdiction data
*/
@Injectable()
export class JurisdictionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Attaches the global feature flag list to a single site configuration record.
   *
   * @param jurisdiction - The raw jurisdiction record to enrich for API consumers.
   * @returns The jurisdiction record with the current global feature flags attached.
   * @throws {Prisma.PrismaClientKnownRequestError} If the feature flag query fails.
   */
  private async attachFeatureFlags<T extends Record<string, unknown>>(
    jurisdiction: T,
  ): Promise<T & { featureFlags: Prisma.FeatureFlagsUncheckedCreateInput[] }> {
    const featureFlags = await this.prisma.featureFlags.findMany();
    return {
      ...jurisdiction,
      featureFlags,
    };
  }

  /**
   * Attaches the global feature flag list to each site configuration in a result set.
   *
   * @param jurisdictions - The raw jurisdiction records to enrich for API consumers.
   * @returns The jurisdictions with the current global feature flags attached.
   * @throws {Prisma.PrismaClientKnownRequestError} If the feature flag query fails.
   */
  private async attachFeatureFlagsList<T extends Record<string, unknown>>(
    jurisdictions: T[],
  ): Promise<
    Array<T & { featureFlags: Prisma.FeatureFlagsUncheckedCreateInput[] }>
  > {
    const featureFlags = await this.prisma.featureFlags.findMany();
    return jurisdictions.map((jurisdiction) => ({
      ...jurisdiction,
      featureFlags,
    }));
  }

  /**
   * Returns the singleton site configuration record.
   *
   * @returns The first jurisdiction row, enriched with global feature flags.
   * @throws {NotFoundException} If no site configuration row exists.
   */
  async findSingleton(): Promise<Jurisdiction> {
    const raw = await this.prisma.jurisdictions.findFirst({
      include: view,
    });
    if (!raw) {
      throw new NotFoundException('No site configuration found');
    }
    return mapTo(Jurisdiction, await this.attachFeatureFlags(raw));
  }

  /**
    this will get a set of jurisdictions given the params passed in
  */
  async list(): Promise<Jurisdiction[]> {
    const rawJurisdictions = await this.prisma.jurisdictions.findMany({
      include: view,
    });
    return mapTo(
      Jurisdiction,
      await this.attachFeatureFlagsList(rawJurisdictions),
    );
  }

  /*
    this will build the where clause for findOne()
  */
  buildWhere({
    jurisdictionId,
    jurisdictionName,
  }: {
    jurisdictionId?: string;
    jurisdictionName?: string;
  }): Prisma.JurisdictionsWhereInput {
    const toReturn: Prisma.JurisdictionsWhereInput = {};
    if (jurisdictionId) {
      toReturn.id = {
        equals: jurisdictionId,
      };
    } else if (jurisdictionName) {
      toReturn.name = {
        equals: jurisdictionName,
      };
    }
    return toReturn;
  }

  /*
    this will return 1 jurisdiction or error
  */
  async findOne(condition: {
    jurisdictionId?: string;
    jurisdictionName?: string;
  }): Promise<Jurisdiction> {
    if (!condition.jurisdictionId && !condition.jurisdictionName) {
      throw new BadRequestException(
        'a jurisdiction id or jurisdiction name must be provided',
      );
    }

    const rawJurisdiction = await this.prisma.jurisdictions.findFirst({
      where: this.buildWhere(condition),
      include: view,
    });

    if (!rawJurisdiction) {
      throw new NotFoundException(
        `jurisdiction ${
          condition.jurisdictionId || condition.jurisdictionName
        } was requested but not found`,
      );
    }

    return mapTo(Jurisdiction, await this.attachFeatureFlags(rawJurisdiction));
  }

  /*
    this will create a jurisdiction
  */
  async create(incomingData: JurisdictionCreate): Promise<Jurisdiction> {
    const rawResult = await this.prisma.jurisdictions.create({
      data: {
        ...incomingData,
        listingFeaturesConfiguration:
          incomingData.listingFeaturesConfiguration as unknown as Prisma.JsonArray,
      },
      include: view,
    });

    return mapTo(Jurisdiction, await this.attachFeatureFlags(rawResult));
  }

  /*
    this will update a jurisdiction's name or items field
    if no jurisdiction has the id of the incoming argument an error is thrown
  */
  async update(incomingData: JurisdictionUpdate): Promise<Jurisdiction> {
    await this.findOrThrow(incomingData.id);

    const rawResults = await this.prisma.jurisdictions.update({
      data: {
        ...incomingData,
        id: undefined,
        listingFeaturesConfiguration:
          incomingData.listingFeaturesConfiguration as unknown as Prisma.JsonArray,
      },
      where: {
        id: incomingData.id,
      },
      include: view,
    });
    return mapTo(Jurisdiction, await this.attachFeatureFlags(rawResults));
  }

  /*
    this will delete a jurisdiction
  */
  async delete(jurisdictionId: string): Promise<SuccessDTO> {
    await this.findOrThrow(jurisdictionId);
    await this.prisma.jurisdictions.delete({
      where: {
        id: jurisdictionId,
      },
    });
    return {
      success: true,
    } as SuccessDTO;
  }

  /*
    this will either find a record or throw a customized error
  */
  async findOrThrow(jurisdictionId: string): Promise<boolean> {
    const jurisdiction = await this.prisma.jurisdictions.findFirst({
      where: {
        id: jurisdictionId,
      },
    });

    if (!jurisdiction) {
      throw new NotFoundException(
        `jurisdictionId ${jurisdictionId} was requested but not found`,
      );
    }

    return true;
  }
}
