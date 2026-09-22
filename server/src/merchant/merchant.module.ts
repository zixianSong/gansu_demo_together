import { Module } from '@nestjs/common';
import { MerchantController } from './merchant.controller';
import { MerchantOrdersService } from './merchant-orders.service';

@Module({
  controllers: [MerchantController],
  providers: [MerchantOrdersService],
})
export class MerchantModule {}
