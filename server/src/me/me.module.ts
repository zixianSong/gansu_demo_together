import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { OrdersService } from './orders.service';
import { ReviewsService } from './reviews.service';
import { TravelersService } from './travelers.service';
import { FavoritesService } from './favorites.service';
import { FootprintsService } from './footprints.service';
import { FeedbackService } from './feedback.service';

@Module({
  imports: [AuthModule],
  controllers: [MeController],
  providers: [MeService, OrdersService, ReviewsService, TravelersService, FavoritesService, FootprintsService, FeedbackService],
})
export class MeModule {}
