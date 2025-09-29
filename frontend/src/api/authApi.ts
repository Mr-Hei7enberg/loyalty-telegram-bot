import { requestJson } from './httpClient';

export interface LoginPayload {
  clientId: string;
  clientSecret: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  message: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return requestJson<LoginResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export async function logout(authToken: string) {
  return requestJson<{ message: string }>('/auth/logout', {
    method: 'POST',
    authToken,
  });
}
