import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PoisService } from './pois.service';

@Controller('pois')
export class PoisController {
  constructor(private readonly poisService: PoisService) {}

  @Get(':id')
  getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.poisService.getDetail(id);
  }
}
