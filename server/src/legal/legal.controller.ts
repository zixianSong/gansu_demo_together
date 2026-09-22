import { Controller, Get } from '@nestjs/common';
import { LegalService } from './legal.service';

@Controller('legal')
export class LegalController {
  constructor(private readonly legal: LegalService) {}

  @Get('privacy-brief')
  privacyBrief() {
    return this.legal.privacyBrief();
  }

  @Get('collect-list')
  collectList() {
    return this.legal.collectList();
  }

  @Get('permissions')
  permissions() {
    return this.legal.permissions();
  }

  @Get('privacy')
  privacy() {
    return this.legal.privacy();
  }
}

@Controller('config')
export class SiteConfigController {
  constructor(private readonly legal: LegalService) {}

  @Get('customer-service')
  customerService() {
    return this.legal.customerService();
  }

  @Get('about')
  about() {
    return this.legal.about();
  }
}
