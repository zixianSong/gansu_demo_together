import { createRouter, createWebHistory } from 'vue-router';
import { getToken } from '@/api/request';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/index.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/AdminLayout.vue'),
      children: [
        {
          path: '',
          redirect: '/articles',
        },
        {
          path: 'articles',
          name: 'articles',
          component: () => import('@/views/articles/index.vue'),
          meta: { title: '文章内容管理', parent: '首页内容配置' },
        },
      ],
    },
  ],
});

router.beforeEach((to) => {
  if (to.meta.public) return true;
  if (!getToken()) return { path: '/login' };
  return true;
});

export default router;
