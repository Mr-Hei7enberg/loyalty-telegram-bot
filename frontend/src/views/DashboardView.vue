<template>
  <section class="dashboard">
    <header class="dashboard-header">
      <div>
        <h1>Аналітика використання</h1>
        <p class="tagline">Оперативні метрики взаємодії користувачів із ботом лояльності.</p>
      </div>
      <button class="logout" type="button" @click="onLogout" :disabled="logoutInProgress">
        {{ logoutInProgress ? 'Вихід...' : 'Вийти' }}
      </button>
    </header>

    <AnalyticsSummaryTable
      :summary="summary"
      :loading="loading"
      @refresh="loadSummary"
    />

    <p v-if="error" class="error" role="alert">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import AnalyticsSummaryTable from '../components/AnalyticsSummaryTable.vue';
import { fetchUsageSummary } from '../api/analyticsApi';
import { getAccessToken, logout } from '../stores/authStore';
import type { UsageSummary } from '../types/analytics';
import { HttpError } from '../api/httpClient';

const emit = defineEmits<{
  'session-expired': [];
  'logged-out': [];
}>();

const summary = reactive<UsageSummary>({ total: 0, actions: [] });
const loading = ref(false);
const error = ref<string | null>(null);
const logoutInProgress = ref(false);

async function loadSummary() {
  const token = getAccessToken();

  if (!token) {
    emit('session-expired');
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await fetchUsageSummary(token);
    summary.total = response.summary.total;
    summary.actions = [...response.summary.actions];
  } catch (err) {
    if (err instanceof HttpError && err.status === 401) {
      emit('session-expired');
      return;
    }

    error.value = err instanceof Error ? err.message : 'Не вдалося отримати дані.';
  } finally {
    loading.value = false;
  }
}

async function onLogout() {
  if (logoutInProgress.value) {
    return;
  }

  logoutInProgress.value = true;
  await logout();
  logoutInProgress.value = false;
  emit('logged-out');
}

onMounted(() => {
  void loadSummary();
});
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: min(960px, 100%);
  margin: 0 auto;
  padding: 32px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.4);
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.tagline {
  margin: 4px 0 0;
  color: #475569;
}

.logout {
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 600;
  background: rgba(15, 23, 42, 0.85);
  color: #f8fafc;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.logout:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.logout:not(:disabled):hover {
  background: rgba(30, 41, 59, 0.9);
}

.error {
  margin: 0;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.25);
  color: #b91c1c;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 24px;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .logout {
    align-self: stretch;
    width: 100%;
  }
}
</style>
