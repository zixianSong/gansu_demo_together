import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get(':id')
  getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.getDetail(id);
  }

  @Get(':id/pois')
  getRelatedPois(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.getRelatedPois(id);
  }

  @Get(':id/routes')
  getRelatedRoutes(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.getRelatedRoutes(id);
  }
}
