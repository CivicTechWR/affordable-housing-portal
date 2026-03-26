import { Module } from '@nestjs/common';
import { CustomListingFeatureService } from '../services/custom-listing-feature.service';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CustomListingFeatureService],
  exports: [CustomListingFeatureService],
})
export class CustomFeatureModule { }
