<template>
  <section class="card" aria-labelledby="login-title">
    <header class="card-header">
      <h1 id="login-title">Вхід до панелі аналітики</h1>
      <p class="subtitle">
        Використайте виданий вам <strong>clientId</strong> та <strong>clientSecret</strong>, щоб отримати
        токен доступу до API.
      </p>
    </header>

    <form class="form" @submit.prevent="onSubmit">
      <label class="field">
        <span>Client ID</span>
        <input
          v-model.trim="clientId"
          type="text"
          name="clientId"
          autocomplete="off"
          required
          :disabled="loading"
        />
      </label>

      <label class="field">
        <span>Client Secret</span>
        <input
          v-model.trim="clientSecret"
          type="password"
          name="clientSecret"
          autocomplete="off"
          required
          :disabled="loading"
        />
      </label>

      <button class="submit" type="submit" :disabled="loading">
        <span v-if="loading">Авторизація...</span>
        <span v-else>Увійти</span>
      </button>

      <p v-if="error" class="error" role="alert">{{ error }}</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{ loading: boolean; error: string | null }>();
const emit = defineEmits<{
  submit: [payload: { clientId: string; clientSecret: string }];
}>();

const clientId = ref('');
const clientSecret = ref('');
const error = ref<string | null>(props.error);

watch(
  () => props.error,
  (newValue) => {
    error.value = newValue;
  },
);

function onSubmit() {
  if (!clientId.value || !clientSecret.value) {
    error.value = 'Будь ласка, заповніть усі поля.';
    return;
  }

  error.value = null;
  emit('submit', { clientId: clientId.value, clientSecret: clientSecret.value });
}
</script>

<style scoped>
.card {
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 18px;
  padding: 32px;
  max-width: 420px;
  width: 100%;
  color: #f8fafc;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.45);
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.subtitle {
  margin: 0;
  color: #cbd5f5;
  font-size: 0.95rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 600;
}

.field input {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.35);
  color: #f8fafc;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field input:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.25);
}

.submit {
  background: linear-gradient(135deg, #38bdf8, #6366f1);
  color: #fff;
  border: none;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 15px 35px rgba(99, 102, 241, 0.35);
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}

.submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.submit:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 40px rgba(56, 189, 248, 0.4);
}

.error {
  margin: 0;
  color: #fecaca;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(248, 113, 113, 0.35);
  padding: 10px 12px;
  border-radius: 10px;
}

@media (max-width: 520px) {
  .card {
    padding: 24px;
  }
}
</style>
