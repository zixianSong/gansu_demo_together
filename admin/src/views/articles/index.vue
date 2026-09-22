<template>
  <div class="articles-page">
    <div class="page-header">
      <h2>文章内容管理</h2>
      <a-button type="primary" style="background: #10b981; border-color: #10b981" @click="openImport">
        从公众号导入
      </a-button>
    </div>

    <div class="table-card">
      <div class="filter-bar">
        <a-select v-model:value="filters.contentType" style="width: 140px" @change="loadList">
          <a-select-option value="">全部类型</a-select-option>
          <a-select-option value="guide">攻略</a-select-option>
          <a-select-option value="travelogue">游记</a-select-option>
        </a-select>
        <a-select v-model:value="filters.status" style="width: 140px" @change="loadList">
          <a-select-option :value="-1">全部状态</a-select-option>
          <a-select-option :value="1">已上架</a-select-option>
          <a-select-option :value="0">已下架</a-select-option>
        </a-select>
        <a-input-search
          v-model:value="filters.keyword"
          placeholder="搜索标题..."
          style="width: 260px"
          allow-clear
          @search="loadList"
        />
      </div>

      <a-table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        row-key="id"
        :pagination="pagination"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'cover'">
            <img v-if="record.coverUrl" :src="record.coverUrl" class="cover-img" alt="封面" />
            <span v-else>-</span>
          </template>
          <template v-else-if="column.key === 'contentType'">
            {{ record.contentType === 'guide' ? '攻略' : '游记' }}
          </template>
          <template v-else-if="column.key === 'publishedAt'">
            {{ formatDate(record.publishedAt) }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'default'">
              {{ record.status === 1 ? '已上架' : '已下架' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="openDetail(record.id)">详情</a-button>
              <a-button type="link" size="small" @click="openEdit(record.id)">编辑</a-button>
              <a-button type="link" size="small" @click="toggleStatus(record)">
                {{ record.status === 1 ? '下架' : '上架' }}
              </a-button>
              <a-popconfirm title="确认删除该文章？" @confirm="remove(record.id)">
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <a-modal
      v-model:open="importOpen"
      title="从公众号导入"
      :confirm-loading="importing"
      ok-text="开始导入"
      @ok="submitImport"
    >
      <a-form layout="vertical">
        <a-form-item label="文章链接" required>
          <a-input
            v-model:value="importUrl"
            placeholder="https://mp.weixin.qq.com/s/..."
          />
        </a-form-item>
        <a-form-item>
          <a-checkbox v-model:checked="importOverwrite">若已存在同链接文章则覆盖</a-checkbox>
        </a-form-item>
        <p class="import-tip">将自动抓取正文、下载图片到本地，导入后默认上架。</p>
      </a-form>
    </a-modal>

    <a-drawer v-model:open="detailOpen" title="文章详情" width="720">
      <template v-if="detail">
        <p><strong>标题：</strong>{{ detail.title }}</p>
        <p><strong>类型：</strong>{{ detail.contentType === 'guide' ? '攻略' : '游记' }}</p>
        <p><strong>作者：</strong>{{ detail.author || '-' }}</p>
        <p><strong>发布时间：</strong>{{ formatDate(detail.publishedAt) }}</p>
        <p><strong>来源：</strong>
          <a v-if="detail.wechatUrl" :href="detail.wechatUrl" target="_blank">{{ detail.wechatUrl }}</a>
          <span v-else>-</span>
        </p>
        <p><strong>标签：</strong>{{ detail.tags?.join('、') || '-' }}</p>
        <div v-if="detail.coverUrl" class="detail-cover">
          <img :src="detail.coverUrl" alt="封面" />
        </div>
        <div class="detail-html" v-html="detail.contentHtml || '<p>暂无正文</p>'" />
      </template>
    </a-drawer>

    <a-modal
      v-model:open="editOpen"
      title="编辑文章"
      :confirm-loading="saving"
      ok-text="保存"
      @ok="submitEdit"
    >
      <a-form v-if="editForm" layout="vertical">
        <a-form-item label="标题" required>
          <a-input v-model:value="editForm.title" />
        </a-form-item>
        <a-form-item label="类型">
          <a-select v-model:value="editForm.contentType">
            <a-select-option value="guide">攻略</a-select-option>
            <a-select-option value="travelogue">游记</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="作者">
          <a-input v-model:value="editForm.author" />
        </a-form-item>
        <a-form-item label="发布时间">
          <a-input v-model:value="editForm.publishedAt" placeholder="2026-09-13T01:23:00.000Z" />
        </a-form-item>
        <a-form-item label="标签（逗号分隔）">
          <a-input v-model:value="editForm.tagsText" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import {
  deleteArticle,
  fetchArticleDetail,
  fetchArticles,
  importWechatArticle,
  updateArticle,
  updateArticleStatus,
  type ArticleDetail,
  type ArticleListItem,
} from '@/api/articles';

const loading = ref(false);
const list = ref<ArticleListItem[]>([]);
const filters = reactive({
  keyword: '',
  contentType: '',
  status: -1 as number,
});
const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
});

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
  { title: '封面', key: 'cover', width: 90 },
  { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
  { title: '类型', key: 'contentType', width: 90 },
  { title: '作者', dataIndex: 'author', key: 'author', width: 120 },
  { title: '发布时间', key: 'publishedAt', width: 120 },
  { title: '状态', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 260 },
];

const importOpen = ref(false);
const importUrl = ref('');
const importOverwrite = ref(false);
const importing = ref(false);

const detailOpen = ref(false);
const detail = ref<ArticleDetail | null>(null);

const editOpen = ref(false);
const editId = ref(0);
const saving = ref(false);
const editForm = ref<{
  title: string;
  contentType: string;
  author: string;
  publishedAt: string;
  tagsText: string;
} | null>(null);

function formatDate(iso: string | null) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('zh-CN');
}

async function loadList() {
  loading.value = true;
  try {
    const res = await fetchArticles({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: filters.keyword,
      contentType: filters.contentType || undefined,
      status: filters.status,
    });
    list.value = res.list;
    pagination.total = res.pagination.total;
  } catch (e) {
    message.error(e instanceof Error ? e.message : '加载失败');
  } finally {
    loading.value = false;
  }
}

function onTableChange(p: TablePaginationConfig) {
  pagination.current = p.current || 1;
  pagination.pageSize = p.pageSize || 20;
  loadList();
}

function openImport() {
  importUrl.value = '';
  importOverwrite.value = false;
  importOpen.value = true;
}

async function submitImport() {
  if (!importUrl.value.trim()) {
    message.warning('请输入公众号文章链接');
    return;
  }
  importing.value = true;
  try {
    const res = await importWechatArticle(importUrl.value.trim(), importOverwrite.value);
    message.success(`导入成功：${res.title}（${res.imageCount} 张图）`);
    importOpen.value = false;
    await loadList();
  } catch (e) {
    message.error(e instanceof Error ? e.message : '导入失败');
  } finally {
    importing.value = false;
  }
}

async function openDetail(id: number) {
  try {
    detail.value = await fetchArticleDetail(id);
    detailOpen.value = true;
  } catch (e) {
    message.error(e instanceof Error ? e.message : '加载详情失败');
  }
}

async function openEdit(id: number) {
  try {
    const data = await fetchArticleDetail(id);
    editId.value = id;
    editForm.value = {
      title: data.title,
      contentType: data.contentType,
      author: data.author || '',
      publishedAt: data.publishedAt || '',
      tagsText: (data.tags || []).join(','),
    };
    editOpen.value = true;
  } catch (e) {
    message.error(e instanceof Error ? e.message : '加载失败');
  }
}

async function submitEdit() {
  if (!editForm.value?.title.trim()) {
    message.warning('标题不能为空');
    return;
  }
  saving.value = true;
  try {
    await updateArticle(editId.value, {
      title: editForm.value.title.trim(),
      contentType: editForm.value.contentType,
      author: editForm.value.author || undefined,
      publishedAt: editForm.value.publishedAt || undefined,
      tags: editForm.value.tagsText
        ? editForm.value.tagsText.split(/[,，]/).map((t) => t.trim()).filter(Boolean)
        : [],
    });
    message.success('保存成功');
    editOpen.value = false;
    await loadList();
  } catch (e) {
    message.error(e instanceof Error ? e.message : '保存失败');
  } finally {
    saving.value = false;
  }
}

async function toggleStatus(record: ArticleListItem) {
  const next = record.status === 1 ? 0 : 1;
  try {
    await updateArticleStatus(record.id, next as 0 | 1);
    message.success(next === 1 ? '已上架' : '已下架');
    await loadList();
  } catch (e) {
    message.error(e instanceof Error ? e.message : '操作失败');
  }
}

async function remove(id: number) {
  try {
    await deleteArticle(id);
    message.success('已删除');
    await loadList();
  } catch (e) {
    message.error(e instanceof Error ? e.message : '删除失败');
  }
}

onMounted(loadList);
</script>

<style scoped>
.articles-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-header h2 {
  margin: 0;
  font-size: 22px;
}

.table-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.cover-img {
  width: 48px;
  height: 32px;
  object-fit: cover;
  border-radius: 4px;
}

.import-tip {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.detail-cover img {
  max-width: 200px;
  border-radius: 8px;
  margin: 12px 0;
}

.detail-html {
  margin-top: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  max-height: 400px;
  overflow: auto;
  font-size: 14px;
  line-height: 1.6;
}

.detail-html :deep(img) {
  max-width: 100%;
}
</style>
