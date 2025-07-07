import { useRequest } from 'ahooks';
import { getUser } from '@/services/user';

export default () => {
    const { data, loading, refresh } = useRequest(getUser);
    
    return {
        data,
        refresh,
        loading
    };
};