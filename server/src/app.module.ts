import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { HomeModule } from './home/home.module';
import { ArticlesModule } from './articles/articles.module';
import { PoisModule } from './pois/pois.module';
/** 临时：只提供 X-User-Id，不是「我的」页面模块。 */
import { MineModule } from './mine/mine.module';
import { ItineraryModule } from './trip-manage/trip-manage.module';

import { RoutesModule } from './routes/routes.module';
import { SearchModule } from './search/search.module';
import { CharterModule } from './charter/charter.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    MineModule,
    HealthModule,
    HomeModule,
    ArticlesModule,
    PoisModule,
    ItineraryModule,
    RoutesModule,
    SearchModule,
    CharterModule,
  ],
})
export class AppModule {}
