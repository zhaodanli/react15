import { request } from '@umijs/max';

export async function getEvents() {
    return request<API.Page>('/api/v1/queryEventsList', {
        method: 'GET'
    });
}