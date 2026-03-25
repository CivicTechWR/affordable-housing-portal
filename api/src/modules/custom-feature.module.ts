import { Module } from '@nestjs/common';
import { CustomFeatureService } from '../services/custom-feature.service';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CustomFeatureService],
  exports: [CustomFeatureService],
})
export class CustomFeatureModule {}
