import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { parseTags, toIso, toNum } from '../../common/utils/serialize';
import { WechatImportService } from '../../wechat-import/wechat-import.service';
import { ImportWechatDto } from './dto/import-wechat.dto';
import { ListArticlesQuery } from './dto/list-articles.query';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class AdminArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wechatImport: WechatImportService,
  ) {}

  async list(query: ListArticlesQuery) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Prisma.ArticleWhereInput = {
      deletedAt: null,
      contentType: { in: ['guide', 'travelogue'] },
    };
    if (query.keyword?.trim()) {
      where.title = { contains: query.keyword.trim() };
    }
    if (query.contentType) {
      where.contentType = query.contentType;
    }
    if (query.status !== undefined) {
      where.status = query.status;
    }

    const [total, rows] = await Promise.all([
      this.prisma.article.count({ where }),
      this.prisma.article.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      list: rows.map((a) => this.toListItem(a)),
      pagination: { page, pageSize, total },
    };
  }

  async getDetail(id: number) {
    const article = await this.findArticle(id);
    return {
      id: toNum(article.id),
      title: article.title,
      coverUrl: article.coverUrl,
      contentType: article.contentType,
      contentHtml: article.contentHtml,
      author: article.author,
      publishedAt: toIso(article.publishedAt),
      tags: parseTags(article.tagsJson),
      status: article.status,
      wechatUrl: article.wechatUrl,
      createdAt: toIso(article.createdAt),
      updatedAt: toIso(article.updatedAt),
    };
  }

  async update(id: number, dto: UpdateArticleDto) {
    await this.findArticle(id);
    const data: Prisma.ArticleUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.contentType !== undefined) data.contentType = dto.contentType;
    if (dto.author !== undefined) data.author = dto.author;
    if (dto.publishedAt !== undefined) {
      data.publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;
    }
    if (dto.tags !== undefined) data.tagsJson = dto.tags;

    const article = await this.prisma.article.update({
      where: { id: BigInt(id) },
      data,
    });
    return this.toListItem(article);
  }

  async updateStatus(id: number, status: 0 | 1) {
    await this.findArticle(id);
    const article = await this.prisma.article.update({
      where: { id: BigInt(id) },
      data: { status },
    });
    return this.toListItem(article);
  }

  async remove(id: number) {
    await this.findArticle(id);
    await this.prisma.article.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date(), status: 0 },
    });
    return { id };
  }

  importWechat(dto: ImportWechatDto) {
    return this.wechatImport.importFromUrl(dto.url, {
      articleId: dto.articleId,
      overwrite: dto.overwrite,
    });
  }

  private async findArticle(id: number) {
    const article = await this.prisma.article.findFirst({
      where: { id: BigInt(id), deletedAt: null },
    });
    if (!article) {
      throw new NotFoundException('文章不存在');
    }
    return article;
  }

  private toListItem(article: {
    id: bigint;
    title: string;
    coverUrl: string | null;
    contentType: string;
    author: string | null;
    publishedAt: Date | null;
    status: number;
    wechatUrl: string | null;
    createdAt: Date;
  }) {
    return {
      id: toNum(article.id),
      title: article.title,
      coverUrl: article.coverUrl,
      contentType: article.contentType,
      author: article.author,
      publishedAt: toIso(article.publishedAt),
      status: article.status,
      wechatUrl: article.wechatUrl,
      createdAt: toIso(article.createdAt),
    };
  }
}
