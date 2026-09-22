import { Module } from '@nestjs/common';
import { WechatImportModule } from '../wechat-import/wechat-import.module';
import { AdminAuthController } from './auth/admin-auth.controller';
import { AdminAuthService } from './auth/admin-auth.service';
import { AdminArticlesController } from './articles/admin-articles.controller';
import { AdminArticlesService } from './articles/admin-articles.service';
import { AdminAuthGuard } from './guards/admin-auth.guard';

@Module({
  imports: [WechatImportModule],
  controllers: [AdminAuthController, AdminArticlesController],
  providers: [AdminAuthService, AdminArticlesService, AdminAuthGuard],
})
export class AdminModule {}
