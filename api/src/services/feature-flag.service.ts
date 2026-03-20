import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  Inject,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { FeatureFlag } from '../dtos/feature-flags/feature-flag.dto';
import { FeatureFlagCreate } from '../dtos/feature-flags/feature-flag-create.dto';
import { FeatureFlagUpdate } from '../dtos/feature-flags/feature-flag-update.dto';
import { SuccessDTO } from '../dtos/shared/success.dto';
import { mapTo } from '../utilities/mapTo';
import { featureFlagMap } from '../enums/feature-flags/feature-flags-enum';

/**
      this is the service for feature flags
      it handles all the backend's business logic for reading/writing/deleting feature flag data
    */
@Injectable()
export class FeatureFlagService {
  constructor(
    private prisma: PrismaService,
    @Inject(Logger)
    private readonly logger = new Logger(FeatureFlagService.name),
  ) {}

  /**
        this will get a set of feature flags
      */
  async list(): Promise<FeatureFlag[]> {
    const rawfeatureFlags = await this.prisma.featureFlags.findMany();
    return mapTo(FeatureFlag, rawfeatureFlags);
  }

  /*
        this will return 1 feature flag or error
      */
  async findOne(featureFlagId: string): Promise<FeatureFlag> {
    if (!featureFlagId) {
      throw new BadRequestException('a feature flag id must be provided');
    }

    const rawFeatureFlag = await this.prisma.featureFlags.findFirst({
      where: {
        id: featureFlagId,
      },
    });

    if (!rawFeatureFlag) {
      throw new NotFoundException(
        `feature flag id ${featureFlagId} was requested but not found`,
      );
    }

    return mapTo(FeatureFlag, rawFeatureFlag);
  }

  /*
        this will create a feature flag
      */
  async create(dto: FeatureFlagCreate): Promise<FeatureFlag> {
    const rawResult = await this.prisma.featureFlags.create({
      data: {
        ...dto,
      },
    });

    return mapTo(FeatureFlag, rawResult);
  }

  /*
        this will update a feature flag's name or description field
        if no feature flag has the id of the incoming argument an error is thrown
      */
  async update(dto: FeatureFlagUpdate): Promise<FeatureFlag> {
    await this.findOrThrow(dto.id);

    const rawResults = await this.prisma.featureFlags.update({
      data: {
        ...dto,
        id: undefined,
      },
      where: {
        id: dto.id,
      },
    });
    return mapTo(FeatureFlag, rawResults);
  }

  /*
        this will delete a feature flag
      */
  async delete(featureFlagId: string): Promise<SuccessDTO> {
    await this.findOrThrow(featureFlagId);
    await this.prisma.featureFlags.delete({
      where: {
        id: featureFlagId,
      },
    });
    return {
      success: true,
    } as SuccessDTO;
  }

  /*
        this will either find a record or throw a customized error
      */
  async findOrThrow(featureFlagId: string): Promise<boolean> {
    const featureFlag = await this.prisma.featureFlags.findFirst({
      where: {
        id: featureFlagId,
      },
    });

    if (!featureFlag) {
      throw new NotFoundException(
        `feature flag id ${featureFlagId} was requested but not found`,
      );
    }

    return true;
  }

  /*
   * Adds all of the feature flags from enums/feature-flags/feature-flags-enum
   * if flag already exists, the insert is skipped
   */
  async addAllNewFeatureFlags(): Promise<SuccessDTO> {
    this.logger.log('Adding feature flags to the DB');
    const created = await this.prisma.featureFlags.createMany({
      data: featureFlagMap.map((flag) => {
        return { ...flag, active: true };
      }),
      skipDuplicates: true,
    });
    this.logger.log(`Added ${created.count} feature flags`);
    return {
      success: true,
    } as SuccessDTO;
  }
}
