import { Controller, Get, Header } from '@nestjs/common';

@Controller('admin')
export class AnalyticsFrontendController {
  private static readonly pageHtml = String.raw`<!DOCTYPE html>
<html lang="uk">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Аналітика програми лояльності</title>
    <style>
      :root {
        color-scheme: light dark;
        font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
        background-color: #0f172a;
        color: #f8fafc;
      }

      body {
        margin: 0;
        display: flex;
        min-height: 100vh;
        justify-content: center;
        align-items: center;
        padding: 24px;
        background: radial-gradient(circle at 0% 0%, #1e293b 0%, #0f172a 60%);
      }

      .card {
        width: min(480px, 100%);
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 20px 50px rgba(15, 23, 42, 0.45);
      }

      h1 {
        margin-top: 0;
        margin-bottom: 8px;
        font-size: 1.75rem;
      }

      p.subtitle {
        margin-top: 0;
        color: #94a3b8;
        font-size: 0.95rem;
      }

      form,
      .summary {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-top: 24px;
      }

      label {
        font-weight: 600;
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 0.95rem;
      }

      input[type='text'],
      input[type='password'] {
        padding: 12px;
        border-radius: 10px;
        border: 1px solid rgba(148, 163, 184, 0.2);
        background: rgba(15, 23, 42, 0.6);
        color: #e2e8f0;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      input[type='text']:focus,
      input[type='password']:focus {
        border-color: #38bdf8;
        box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.25);
      }

      button {
        padding: 12px;
        border-radius: 10px;
        border: none;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.15s ease, box-shadow 0.2s ease;
      }

      button.primary {
        background: linear-gradient(135deg, #38bdf8, #6366f1);
        color: white;
        box-shadow: 0 12px 30px rgba(99, 102, 241, 0.4);
      }

      button.secondary {
        background: rgba(148, 163, 184, 0.15);
        color: #e2e8f0;
        border: 1px solid rgba(148, 163, 184, 0.2);
      }

      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        box-shadow: none;
      }

      .alert {
        padding: 12px 16px;
        border-radius: 10px;
        font-size: 0.9rem;
      }

      .alert.error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(248, 113, 113, 0.25);
        color: #fca5a5;
      }

      .alert.success {
        background: rgba(34, 197, 94, 0.12);
        border: 1px solid rgba(74, 222, 128, 0.25);
        color: #bbf7d0;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 16px;
      }

      th,
      td {
        padding: 10px 12px;
        text-align: left;
        border-bottom: 1px solid rgba(148, 163, 184, 0.2);
      }

      th {
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #94a3b8;
      }

      .summary-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }

      .total {
        font-size: 1.15rem;
        font-weight: 700;
      }

      @media (max-width: 480px) {
        .card {
          padding: 24px;
        }

        h1 {
          font-size: 1.45rem;
        }

        button {
          width: 100%;
        }

        .summary-header {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div id="app"></div>
    </div>

    <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js" integrity="sha384-6G4tiT8W1vWXtevA7wBmWCbw73vQbFb5x86Ty6AHdmicJ/CjXbe1TjBTQYSYV8hD" crossorigin="anonymous"></script>
    <script>
      const { createApp, reactive, computed, onMounted } = Vue;
      const STORAGE_KEY = 'loyalty-admin-session';

      createApp({
        setup() {
          const form = reactive({
            clientId: '',
            clientSecret: '',
          });

          const state = reactive({
            isLoading: false,
            token: null,
            expiresAt: null,
            error: '',
            message: '',
            summary: null,
          });

          const isAuthenticated = computed(() => {
            return Boolean(state.token) && typeof state.expiresAt === 'number' && state.expiresAt > Date.now();
          });

          const actionsList = computed(() => {
            const actions = state.summary?.actions;
            return Array.isArray(actions) ? actions : [];
          });

          const totalActions = computed(() => {
            if (state.summary && typeof state.summary.total === 'number') {
              return state.summary.total;
            }

            const parsed = Number(state.summary?.total ?? 0);
            return Number.isFinite(parsed) ? parsed : 0;
          });

          const hasSummary = computed(() => actionsList.value.length > 0);

          function resolveErrorMessage(error, fallback) {
            if (typeof error === 'string' && error.trim().length > 0) {
              return error;
            }

            if (typeof error === 'object' && error && 'message' in error) {
              const message = String(error.message ?? '').trim();
              if (message.length > 0) {
                return message;
              }
            }

            return fallback;
          }

          async function login() {
            state.error = '';
            state.message = '';
            state.isLoading = true;

            try {
              const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  clientId: form.clientId.trim(),
                  clientSecret: form.clientSecret.trim(),
                }),
              });

              if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                const message = errorBody?.message ?? 'Не вдалося виконати авторизацію.';
                throw new Error(Array.isArray(message) ? message.join(', ') : message);
              }

              const payload = await response.json();

              state.token = payload.token;
              state.expiresAt = Date.now() + Number(payload.expiresIn ?? 0) * 1000;
              state.message = payload.message ?? 'Авторизація успішна.';
              form.clientSecret = '';

              persistSession();
              await loadSummary();
            } catch (error) {
              console.error('Помилка авторизації', error);
              state.error = resolveErrorMessage(error, 'Сталася непередбачувана помилка.');
              state.token = null;
              state.expiresAt = null;
              state.summary = null;
              clearSession();
            } finally {
              state.isLoading = false;
            }
          }

          async function loadSummary() {
            if (!state.token) {
              return;
            }

            state.error = '';
            try {
              const response = await fetch('/admin/analytics', {
                headers: {
                  Authorization: 'Bearer ' + state.token,
                },
              });

              if (response.status === 401) {
                throw new Error('Сесію завершено. Увійдіть повторно.');
              }

              if (!response.ok) {
                throw new Error('Не вдалося отримати статистику.');
              }

              const payload = await response.json();
              state.summary = payload.summary ?? null;
              state.message = payload.message ?? 'Статистику оновлено.';
              persistSession();
            } catch (error) {
              console.error('Помилка отримання статистики', error);
              state.error = resolveErrorMessage(error, 'Виникла помилка при запиті статистики.');
              state.summary = null;
              if (state.error.includes('Сесію завершено')) {
                state.token = null;
                state.expiresAt = null;
                clearSession();
              }
            }
          }

          function logout() {
            state.token = null;
            state.expiresAt = null;
            state.summary = null;
            state.message = '';
            form.clientSecret = '';
            clearSession();
          }

          function persistSession() {
            if (!state.token || !state.expiresAt) {
              return;
            }

            const payload = {
              token: state.token,
              expiresAt: state.expiresAt,
              clientId: form.clientId,
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
          }

          function clearSession() {
            localStorage.removeItem(STORAGE_KEY);
          }

          function restoreSession() {
            try {
              const raw = localStorage.getItem(STORAGE_KEY);
              if (!raw) {
                return;
              }

              const payload = JSON.parse(raw);
              if (typeof payload.token === 'string' && typeof payload.expiresAt === 'number' && payload.expiresAt > Date.now()) {
                state.token = payload.token;
                state.expiresAt = payload.expiresAt;
                form.clientId = payload?.clientId ?? '';
                void loadSummary();
              } else {
                clearSession();
              }
            } catch (error) {
              console.warn('Не вдалося відновити сесію', error);
              clearSession();
            }
          }

          onMounted(() => {
            restoreSession();
          });

          return {
            form,
            state,
            isAuthenticated,
            hasSummary,
            actionsList,
            totalActions,
            login,
            logout,
            loadSummary,
          };
        },
        template: \`
          <div>
            <h1>Статистика використання</h1>
            <p class="subtitle">
              Увійдіть за допомогою службових облікових даних, щоб переглянути активність Telegram-бота.
            </p>

            <div v-if="state.error" class="alert error">{{ state.error }}</div>
            <div v-if="state.message && !state.error" class="alert success">{{ state.message }}</div>

            <form v-if="!isAuthenticated" @submit.prevent="login">
              <label>
                Ідентифікатор клієнта
                <input v-model="form.clientId" type="text" required autocomplete="username" placeholder="Наприклад, admin" />
              </label>
              <label>
                Секретний ключ
                <input v-model="form.clientSecret" type="password" required autocomplete="current-password" placeholder="Ваш секрет" />
              </label>
              <button class="primary" type="submit" :disabled="state.isLoading">
                {{ state.isLoading ? 'Вхід...' : 'Увійти' }}
              </button>
            </form>

            <section v-else class="summary">
              <div class="summary-header">
                <div>
                  <span class="total">Загалом дій: {{ totalActions }}</span>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <button class="secondary" type="button" @click="logout">Вийти</button>
                  <button class="primary" type="button" @click="loadSummary" :disabled="state.isLoading">
                    {{ state.isLoading ? 'Оновлення...' : 'Оновити' }}
                  </button>
                </div>
              </div>

              <p v-if="!hasSummary" style="color: #94a3b8; margin: 0;">Ще немає даних про активність.</p>

              <table v-else>
                <thead>
                  <tr>
                    <th>Подія</th>
                    <th>Кількість</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="action in actionsList" :key="action.action">
                    <td>{{ action.action }}</td>
                    <td>{{ action.count }}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        \`,
      }).mount('#app');
    </script>
  </body>
</html>`;

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  renderLoginPage(): string {
    return AnalyticsFrontendController.pageHtml;
  }
}
