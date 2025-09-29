import { computed, reactive } from 'vue';
import { login as loginApi, logout as logoutApi } from '../api/authApi';

interface AuthState {
  accessToken: string | null;
  expiresAt: number | null;
}

const STORAGE_TOKEN_KEY = 'loyalty-admin-token';
const STORAGE_EXPIRES_KEY = 'loyalty-admin-token-expires-at';

const storage = typeof window !== 'undefined' ? window.localStorage : null;

function readInitialState(): AuthState {
  const rawToken = storage?.getItem(STORAGE_TOKEN_KEY) ?? null;
  const rawExpiresAt = storage?.getItem(STORAGE_EXPIRES_KEY) ?? null;

  return {
    accessToken: rawToken,
    expiresAt: rawExpiresAt ? Number.parseInt(rawExpiresAt, 10) : null,
  };
}

const state = reactive<AuthState>(readInitialState());

export const isAuthenticated = computed(() => {
  if (!state.accessToken || !state.expiresAt) {
    return false;
  }

  if (Date.now() > state.expiresAt) {
    clearSession();
    return false;
  }

  return true;
});

export function getAccessToken() {
  return isAuthenticated.value ? state.accessToken : null;
}

export async function login(clientId: string, clientSecret: string) {
  const response = await loginApi({ clientId, clientSecret });
  const expiresAt = Date.now() + response.expiresIn * 1000;

  state.accessToken = response.token;
  state.expiresAt = expiresAt;

  storage?.setItem(STORAGE_TOKEN_KEY, response.token);
  storage?.setItem(STORAGE_EXPIRES_KEY, String(expiresAt));

  return response.message;
}

export async function logout() {
  const token = state.accessToken;

  if (token) {
    try {
      await logoutApi(token);
    } catch (error) {
      // Ігноруємо помилки завершення сесії, оскільки токен буде видалений локально.
      console.warn('Не вдалося коректно завершити сесію на сервері.', error);
    }
  }

  clearSession();
}

function clearSession() {
  state.accessToken = null;
  state.expiresAt = null;
  storage?.removeItem(STORAGE_TOKEN_KEY);
  storage?.removeItem(STORAGE_EXPIRES_KEY);
}
