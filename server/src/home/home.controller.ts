import { Controller, Get, Query } from '@nestjs/common';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('banners')
  getBanners() {
    return this.homeService.getBanners();
  }

  @Get('hot-destinations')
  getHotDestinations(@Query('limit') limit?: string) {
    return this.homeService.getHotDestinations(
      limit ? Number(limit) : 4,
    );
  }

  @Get('hot-routes')
  getHotRoutes(@Query('limit') limit?: string) {
    return this.homeService.getHotRoutes(limit ? Number(limit) : 4);
  }

  @Get('feed')
  getFeed(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.homeService.getFeed(
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 10,
    );
  }
}
