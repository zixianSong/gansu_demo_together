import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ItineraryService } from './trip-manage.service';
import {
  ApplyPlanDto,
  CompleteItemDto,
  CreateConversationDto,
  IgnoreHintDto,
  RestoreSnapshotDto,
  SenseDto,
  SwitchPlanDto,
} from './dto/trip-manage.dto';

@Controller('itinerary')
export class ItineraryController {
  constructor(private readonly itinerary: ItineraryService) {}

  @Get('current')
  getCurrent(
    @Headers('x-user-id') userHeader: string | undefined,
    @Query('date') date?: string,
    @Query('slot') slot?: string,
    @Query('nodeId') nodeId?: string,
  ) {
    return this.itinerary.getCurrent(this.itinerary.userId(userHeader), {
      date,
      slot,
      nodeId,
    });
  }

  @Get('plans')
  listPlans(
    @Headers('x-user-id') userHeader: string | undefined,
    @Query('status') status?: string,
  ) {
    return this.itinerary.listPlans(this.itinerary.userId(userHeader), status);
  }

  @Get('plans/:planId')
  getPlan(
    @Headers('x-user-id') userHeader: string | undefined,
    @Param('planId') planId: string,
    @Query('date') date?: string,
    @Query('slot') slot?: string,
    @Query('nodeId') nodeId?: string,
  ) {
    return this.itinerary.getPlanView(
      this.itinerary.userId(userHeader),
      BigInt(planId),
      { date, slot, nodeId },
    );
  }

  @Get('plans/:planId/switch-preview')
  previewSwitch(
    @Headers('x-user-id') userHeader: string | undefined,
    @Param('planId') planId: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    return this.itinerary.previewSwitch(
      this.itinerary.userId(userHeader),
      BigInt(planId),
      { lat: lat ? Number(lat) : undefined, lng: lng ? Number(lng) : undefined },
    );
  }

  @Post('plans/:planId/switch')
  switchPlan(
    @Headers('x-user-id') userHeader: string | undefined,
    @Param('planId') planId: string,
    @Body() body: SwitchPlanDto,
  ) {
    return this.itinerary.switchPlan(
      this.itinerary.userId(userHeader),
      BigInt(planId),
      { lat: body.lat, lng: body.lng },
    );
  }

  @Get('plans/:planId/snapshots')
  snapshots(
    @Headers('x-user-id') userHeader: string | undefined,
    @Param('planId') planId: string,
  ) {
    return this.itinerary.listSnapshots(
      this.itinerary.userId(userHeader),
      BigInt(planId),
    );
  }

  @Post('plans/:planId/snapshots/:snapshotId/restore')
  restore(
    @Headers('x-user-id') userHeader: string | undefined,
    @Param('planId') planId: string,
    @Param('snapshotId') snapshotId: string,
    @Body() body: RestoreSnapshotDto,
  ) {
    return this.itinerary.restoreSnapshot(
      this.itinerary.userId(userHeader),
      BigInt(planId),
      BigInt(snapshotId),
      { lat: body.lat, lng: body.lng },
    );
  }

  @Post('apply')
  apply(
    @Headers('x-user-id') userHeader: string | undefined,
    @Body() body: ApplyPlanDto,
  ) {
    return this.itinerary.applyPreview(this.itinerary.userId(userHeader), body);
  }

  @Post('items/:itemId/complete')
  complete(
    @Headers('x-user-id') userHeader: string | undefined,
    @Param('itemId') itemId: string,
    @Body() body: CompleteItemDto,
  ) {
    return this.itinerary.completeItem(
      this.itinerary.userId(userHeader),
      BigInt(itemId),
      body.completed !== false,
    );
  }

  @Post('sense')
  sense(
    @Headers('x-user-id') userHeader: string | undefined,
    @Body() body: SenseDto,
  ) {
    return this.itinerary.sense(this.itinerary.userId(userHeader), body);
  }

  @Post('hints/ignore')
  ignore(
    @Headers('x-user-id') userHeader: string | undefined,
    @Body() body: IgnoreHintDto,
  ) {
    return this.itinerary.ignoreHint(
      this.itinerary.userId(userHeader),
      body.hintKey,
    );
  }

  @Get('conversations')
  conversations(
    @Headers('x-user-id') userHeader: string | undefined,
    @Query('planId') planId?: string,
  ) {
    return this.itinerary.listConversations(
      this.itinerary.userId(userHeader),
      planId ? BigInt(planId) : undefined,
    );
  }

  @Post('conversations')
  addConversation(
    @Headers('x-user-id') userHeader: string | undefined,
    @Body() body: CreateConversationDto,
  ) {
    return this.itinerary.addConversation(
      this.itinerary.userId(userHeader),
      body,
    );
  }
}
