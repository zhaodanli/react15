import { useQuery } from 'react-query';
import request from './request';

export default function useUsers(queryKey) {
    return useQuery(queryKey, () => request.get('/users'), {
        refetchOnWindowFocus: true, // 窗口获取焦点重新获取
        refetchOnReconnect: true, // 窗口恢复
        staleTime: Infinity, // 过期时间 Infinity
        cacheTime: 5000,
        // refetchInterval: 1000 // 轮询
    })
}