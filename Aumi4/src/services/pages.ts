import { request } from '@umijs/max';

export async function getPages() {
    return request<API.Page>('/api/v1/queryPageList', {
        method: 'GET'
    });
}