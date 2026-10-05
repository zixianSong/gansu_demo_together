import { Module } from '@nestjs/common';
import { ItineraryController } from './trip-manage.controller';
import { ItineraryService } from './trip-manage.service';

@Module({
  controllers: [ItineraryController],
  providers: [ItineraryService],
  exports: [ItineraryService],
})
export class ItineraryModule {}
