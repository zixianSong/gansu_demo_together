import { Injectable } from '@nestjs/common';
import {
  ABOUT,
  COLLECT_LIST,
  CUSTOMER_SERVICE,
  PERMISSIONS,
  PRIVACY_BRIEF,
  PRIVACY_FULL,
} from './legal.content';

@Injectable()
export class LegalService {
  customerService() {
    return CUSTOMER_SERVICE;
  }

  about() {
    return ABOUT;
  }

  privacyBrief() {
    return PRIVACY_BRIEF;
  }

  collectList() {
    return COLLECT_LIST;
  }

  permissions() {
    return PERMISSIONS;
  }

  privacy() {
    return PRIVACY_FULL;
  }
}
