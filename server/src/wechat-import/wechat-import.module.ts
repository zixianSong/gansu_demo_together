import { Module } from '@nestjs/common';
import { WechatImportService } from './wechat-import.service';

@Module({
  providers: [WechatImportService],
  exports: [WechatImportService],
})
export class WechatImportModule {}
