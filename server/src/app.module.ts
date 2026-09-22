import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { HomeModule } from './home/home.module';
import { ArticlesModule } from './articles/articles.module';
import { PoisModule } from './pois/pois.module';
import { RoutesModule } from './routes/routes.module';
import { SearchModule } from './search/search.module';
import { AuthModule } from './auth/auth.module';
import { MeModule } from './me/me.module';
import { LegalModule } from './legal/legal.module';
import { MerchantModule } from './merchant/merchant.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    HealthModule,
    HomeModule,
    ArticlesModule,
    PoisModule,
    RoutesModule,
    SearchModule,
    AuthModule,
    MeModule,
    LegalModule,
    MerchantModule,
  ],
})
export class AppModule {}
