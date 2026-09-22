import { Module } from '@nestjs/common';
import { CharterController } from './charter.controller';
import { CharterService } from './charter.service';

@Module({
  controllers: [CharterController],
  providers: [CharterService],
})
export class CharterModule {}
