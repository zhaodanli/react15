import { request } from '@umijs/max';

export async function getUser() {
    return request<string>('/api/user', {
        method: 'GET',
    });
}

export async function addUser(
    body?: API.User
) {
    return request<string>('/api/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body
    });
}