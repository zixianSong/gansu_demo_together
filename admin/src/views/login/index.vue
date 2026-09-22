<template>
  <div class="login-page">
    <div class="login-card">
      <h1>甘肃旅游运营后台</h1>
      <p class="subtitle">请登录后继续</p>
      <a-form :model="form" layout="vertical" @finish="onSubmit">
        <a-form-item label="账号" name="username" :rules="[{ required: true, message: '请输入账号' }]">
          <a-input v-model:value="form.username" size="large" placeholder="admin" />
        </a-form-item>
        <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password v-model:value="form.password" size="large" placeholder="请输入密码" />
        </a-form-item>
        <a-button type="primary" html-type="submit" size="large" block :loading="loading">
          登录
        </a-button>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { login } from '@/api/auth';

const router = useRouter();
const loading = ref(false);
const form = reactive({ username: 'admin', password: 'admin123' });

async function onSubmit() {
  loading.value = true;
  try {
    await login(form.username, form.password);
    message.success('登录成功');
    router.push('/articles');
  } catch (e) {
    message.error(e instanceof Error ? e.message : '登录失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eff6ff, #f8fafc);
}

.login-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

h1 {
  margin: 0;
  font-size: 22px;
  text-align: center;
}

.subtitle {
  margin: 8px 0 24px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}
</style>
