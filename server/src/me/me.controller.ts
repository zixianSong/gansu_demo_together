import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import type { Request } from 'express';
import { CurrentUserId, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateFavoriteDto, CreateFeedbackDto, CreateReviewDto, CreateTravelerDto, OrderActionDto, ReportFootprintDto, ToggleAnonymousDto, UpdateProfileDto, UpdateTravelerDto } from '../auth/dto';
import { MeService } from './me.service';
import { OrdersService } from './orders.service';
import { ReviewsService } from './reviews.service';
import { TravelersService } from './travelers.service';
import { FavoritesService } from './favorites.service';
import { FootprintsService } from './footprints.service';
import { FeedbackService } from './feedback.service';

const avatarDir = join(process.cwd(), 'uploads', 'avatars');
const reviewMediaDir = join(process.cwd(), 'uploads', 'reviews');
mkdirSync(avatarDir, { recursive: true });
mkdirSync(reviewMediaDir, { recursive: true });

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(
    private readonly meService: MeService,
    private readonly ordersService: OrdersService,
    private readonly reviewsService: ReviewsService,
    private readonly travelersService: TravelersService,
    private readonly favoritesService: FavoritesService,
    private readonly footprintsService: FootprintsService,
    private readonly feedbackService: FeedbackService,
  ) {}

  @Get('profile')
  getProfile(@CurrentUserId() userId: number) {
    return this.meService.getProfile(userId);
  }

  @Put('profile')
  updateProfile(@CurrentUserId() userId: number, @Body() dto: UpdateProfileDto) {
    return this.meService.updateProfile(userId, dto);
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: avatarDir,
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname || '') || '.jpg';
          cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  uploadAvatar(
    @CurrentUserId() userId: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    this.meService.ensureImage(file);
    const proto = req.protocol;
    const host = req.get('host') || 'localhost:3000';
    return this.meService.saveAvatar(userId, file.filename, `${proto}://${host}`);
  }

  @Get('orders')
  listOrders(
    @CurrentUserId() userId: number,
    @Query('tab') tab?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.ordersService.list(userId, { tab, keyword, page, pageSize });
  }

  @Get('orders/:orderId/rebook')
  rebookOrder(
    @CurrentUserId() userId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.ordersService.rebook(userId, orderId);
  }

  @Post('orders/:orderId/cancel')
  cancelOrder(
    @CurrentUserId() userId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() dto: OrderActionDto = {},
  ) {
    return this.ordersService.cancel(userId, orderId, dto?.reason);
  }

  @Post('orders/:orderId/refund')
  refundOrder(
    @CurrentUserId() userId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() dto: OrderActionDto = {},
  ) {
    return this.ordersService.refund(userId, orderId, dto?.reason);
  }

  @Delete('orders/:orderId')
  deleteOrder(
    @CurrentUserId() userId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.ordersService.remove(userId, orderId);
  }

  @Get('orders/:orderId')
  getOrder(
    @CurrentUserId() userId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.ordersService.detail(userId, orderId);
  }

  @Get('reviews/pending')
  pendingReviews(
    @CurrentUserId() userId: number,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.reviewsService.pending(userId, { page, pageSize });
  }

  @Get('reviews/posted')
  postedReviews(
    @CurrentUserId() userId: number,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.reviewsService.posted(userId, { page, pageSize });
  }

  @Post('reviews')
  createReview(
    @CurrentUserId() userId: number,
    @Body() dto: CreateReviewDto,
    @Req() req: Request,
  ) {
    const proto = req.protocol;
    const host = req.get('host') || 'localhost:3000';
    return this.reviewsService.create(userId, dto, `${proto}://${host}`);
  }

  @Put('reviews/:reviewId/anonymous')
  toggleAnonymous(
    @CurrentUserId() userId: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() dto: ToggleAnonymousDto,
  ) {
    return this.reviewsService.setAnonymous(userId, reviewId, dto.isAnonymous);
  }

  @Post('media')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: reviewMediaDir,
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname || '') || '.jpg';
          cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const proto = req.protocol;
    const host = req.get('host') || 'localhost:3000';
    return this.reviewsService.saveMedia(file, `${proto}://${host}`);
  }

  @Get('travelers')
  listTravelers(@CurrentUserId() userId: number) {
    return this.travelersService.list(userId);
  }

  @Post('travelers')
  createTraveler(@CurrentUserId() userId: number, @Body() dto: CreateTravelerDto) {
    return this.travelersService.create(userId, dto);
  }

  @Put('travelers/:travelerId')
  updateTraveler(
    @CurrentUserId() userId: number,
    @Param('travelerId', ParseIntPipe) travelerId: number,
    @Body() dto: UpdateTravelerDto,
  ) {
    return this.travelersService.update(userId, travelerId, dto);
  }

  @Delete('travelers/:travelerId')
  deleteTraveler(
    @CurrentUserId() userId: number,
    @Param('travelerId', ParseIntPipe) travelerId: number,
  ) {
    return this.travelersService.remove(userId, travelerId);
  }

  @Get('favorites')
  listFavorites(
    @CurrentUserId() userId: number,
    @Query('tab') tab?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.favoritesService.list(userId, { tab, page, pageSize });
  }

  @Post('favorites')
  addFavorite(@CurrentUserId() userId: number, @Body() dto: CreateFavoriteDto) {
    return this.favoritesService.add(userId, dto);
  }

  @Delete('favorites/:favoriteId')
  removeFavorite(
    @CurrentUserId() userId: number,
    @Param('favoriteId', ParseIntPipe) favoriteId: number,
  ) {
    return this.favoritesService.remove(userId, favoriteId);
  }

  @Get('footprints')
  listFootprints(
    @CurrentUserId() userId: number,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.footprintsService.list(userId, { page, pageSize });
  }

  @Post('footprints')
  reportFootprint(@CurrentUserId() userId: number, @Body() dto: ReportFootprintDto) {
    return this.footprintsService.report(userId, dto);
  }

  @Post('feedback')
  createFeedback(@CurrentUserId() userId: number, @Body() dto: CreateFeedbackDto) {
    return this.feedbackService.create(userId, dto);
  }
}
