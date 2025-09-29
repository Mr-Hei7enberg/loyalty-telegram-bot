<template>
  <section class="summary-card" aria-live="polite">
    <header class="summary-header">
      <div>
        <h2>Активність користувачів</h2>
        <p class="summary-subtitle">Загальна кількість дій: <strong>{{ summary.total }}</strong></p>
      </div>
      <button class="refresh" type="button" @click="$emit('refresh')" :disabled="loading">
        <span v-if="loading">Оновлення...</span>
        <span v-else>Оновити</span>
      </button>
    </header>

    <table v-if="summary.actions.length" class="summary-table">
      <thead>
        <tr>
          <th scope="col">Дія</th>
          <th scope="col">Кількість</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in summary.actions" :key="item.action">
          <td>{{ item.action }}</td>
          <td>{{ item.count }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty">Ще не зафіксовано жодної події.</p>
  </section>
</template>

<script setup lang="ts">
import type { UsageSummary } from '../types/analytics';

defineProps<{ summary: UsageSummary; loading?: boolean }>();

defineEmits<{ refresh: [] }>();
</script>

<style scoped>
.summary-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(14px);
  color: #0f172a;
  background-color: rgba(248, 250, 252, 0.9);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.summary-subtitle {
  margin: 4px 0 0;
  color: #475569;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
}

.summary-table th,
.summary-table td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
}

.summary-table th {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: #64748b;
}

.refresh {
  border: none;
  background: linear-gradient(135deg, #38bdf8, #6366f1);
  color: #fff;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}

.refresh:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  box-shadow: none;
}

.refresh:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 30px rgba(56, 189, 248, 0.35);
}

.empty {
  margin: 0;
  color: #64748b;
}

@media (max-width: 640px) {
  .summary-card {
    padding: 16px;
  }

  .summary-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .refresh {
    align-self: stretch;
    width: 100%;
    text-align: center;
  }
}
</style>
