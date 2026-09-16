import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RoutesService } from './routes.service';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get(':id')
  getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.routesService.getDetail(id);
  }
}
