import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { AdminArticlesService } from './admin-articles.service';
import { ImportWechatDto } from './dto/import-wechat.dto';
import { ListArticlesQuery } from './dto/list-articles.query';
import { UpdateArticleDto } from './dto/update-article.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('admin/articles')
@UseGuards(AdminAuthGuard)
export class AdminArticlesController {
  constructor(private readonly articlesService: AdminArticlesService) {}

  @Get()
  list(@Query() query: ListArticlesQuery) {
    return this.articlesService.list(query);
  }

  @Post('import-wechat')
  importWechat(@Body() body: ImportWechatDto) {
    return this.articlesService.importWechat(body);
  }

  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.getDetail(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateArticleDto,
  ) {
    return this.articlesService.update(id, body);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateStatusDto,
  ) {
    return this.articlesService.updateStatus(id, body.status);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.remove(id);
  }
}
