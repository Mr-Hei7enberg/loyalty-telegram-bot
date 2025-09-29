<template>
  <div class="page">
    <main class="content">
      <transition name="fade" mode="out-in">
        <LoginView
          v-if="!isAuthenticated"
          :key="'login'"
          :loading="loading"
          :error="errorMessage"
          @submit="handleLogin"
        />
        <DashboardView
          v-else
          :key="'dashboard'"
          @session-expired="handleSessionExpired"
          @logged-out="handleLoggedOut"
        />
      </transition>
      <p v-if="infoMessage" class="info" role="status">{{ infoMessage }}</p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import LoginView from './views/LoginView.vue';
import DashboardView from './views/DashboardView.vue';
import {
  isAuthenticated as isAuthenticatedState,
  login as loginStore,
  logout as logoutStore,
} from './stores/authStore';

const isAuthenticated = computed(() => isAuthenticatedState.value);
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const infoMessage = ref<string | null>(null);

async function handleLogin(payload: { clientId: string; clientSecret: string }) {
  if (loading.value) {
    return;
  }

  loading.value = true;
  errorMessage.value = null;
  infoMessage.value = null;

  try {
    const message = await loginStore(payload.clientId, payload.clientSecret);
    infoMessage.value = message;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Не вдалося виконати авторизацію.';
  } finally {
    loading.value = false;
  }
}

async function handleSessionExpired() {
  await logoutStore();
  infoMessage.value = null;
  errorMessage.value = 'Сесію завершено. Будь ласка, авторизуйтеся повторно.';
}

function handleLoggedOut() {
  infoMessage.value = 'Сесію завершено.';
  errorMessage.value = null;
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: radial-gradient(circle at 20% 20%, rgba(14, 165, 233, 0.25), transparent 55%),
    radial-gradient(circle at 80% 10%, rgba(139, 92, 246, 0.2), transparent 50%),
    linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.info {
  margin: 0;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.25);
  color: #1d4ed8;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
