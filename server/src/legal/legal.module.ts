import { Module } from '@nestjs/common';
import { LegalController, SiteConfigController } from './legal.controller';
import { LegalService } from './legal.service';

@Module({
  controllers: [LegalController, SiteConfigController],
  providers: [LegalService],
})
export class LegalModule {}
