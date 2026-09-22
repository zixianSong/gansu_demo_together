<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1 class="logo-text">甘肃旅游</h1>
        <p class="logo-sub">运营后台</p>
      </div>
      <nav class="sidebar-nav">
        <div class="menu-group">
          <div class="menu-parent">首页内容配置</div>
          <router-link to="/articles" class="submenu-item" active-class="submenu-active">
            文章内容管理
          </router-link>
        </div>
      </nav>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <a-breadcrumb>
          <a-breadcrumb-item>{{ parentTitle }}</a-breadcrumb-item>
          <a-breadcrumb-item>{{ pageTitle }}</a-breadcrumb-item>
        </a-breadcrumb>
        <div class="top-actions">
          <span class="user-name">运营管理员</span>
          <a-button type="primary" danger @click="logout">退出登录</a-button>
        </div>
      </header>
      <div class="page-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { clearToken } from '@/api/request';

const route = useRoute();
const router = useRouter();

const parentTitle = computed(() => String(route.meta.parent || '首页内容配置'));
const pageTitle = computed(() => String(route.meta.title || '文章内容管理'));

function logout() {
  clearToken();
  router.push('/login');
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.sidebar {
  width: 240px;
  position: fixed;
  inset: 0 auto 0 0;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  z-index: 10;
}

.sidebar-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.logo-text {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.logo-sub {
  margin: 4px 0 0;
  font-size: 12px;
  color: #9ca3af;
}

.sidebar-nav {
  padding: 16px;
}

.menu-parent {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  padding: 8px 12px;
}

.submenu-item {
  display: block;
  margin-top: 4px;
  padding: 8px 12px 8px 24px;
  border-radius: 6px;
  color: #6b7280;
  text-decoration: none;
  font-size: 13px;
}

.submenu-item:hover {
  background: #f3f4f6;
  color: #374151;
}

.submenu-active {
  background: #eff6ff !important;
  color: #3b82f6 !important;
  font-weight: 500;
}

.main-content {
  margin-left: 240px;
  flex: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-bar {
  height: 64px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 5;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name {
  font-size: 14px;
  color: #374151;
}

.page-content {
  padding: 24px;
  flex: 1;
}
</style>
