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

export async function signin(
  body?: API.SigninUser
) {
  return request('/api/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body
  });
}