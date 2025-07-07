import { request } from '@umijs/max';

export async function signup(
  body?: API.SignupUser
) {
  return request<string>('/api/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body
  });
}