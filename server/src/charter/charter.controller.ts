import { Controller, Get, Query } from '@nestjs/common';
import { CharterService } from './charter.service';

@Controller('charter')
export class CharterController {
  constructor(private readonly charterService: CharterService) {}

  @Get('routes')
  findRoutes(@Query() query: Record<string, unknown>) {
    return this.charterService.findRoutes(query);
  }
}
