import { request } from '@umijs/max';

export async function getUser() {
    return request<API.ListData<API.User>>('/api/user', {
        method: 'GET'
    });
}