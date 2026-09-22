import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { MerchantOrdersService } from './merchant-orders.service';

@Controller('merchant')
export class MerchantController {
  constructor(private readonly orders: MerchantOrdersService) {}

  @Get('orders/summary')
  summary() {
    return this.orders.summary();
  }

  @Get('orders/todos')
  todos() {
    return this.orders.todos();
  }

  @Get('orders')
  list(
    @Query('keyword') keyword?: string,
    @Query('dateStart') dateStart?: string,
    @Query('dateEnd') dateEnd?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.orders.list({ keyword, dateStart, dateEnd, status, page, pageSize });
  }

  @Get('orders/:id/check-ins')
  checkIns(@Param('id', ParseIntPipe) id: number) {
    return this.orders.checkIns(id);
  }

  @Get('orders/:id')
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.orders.detail(id);
  }
}
