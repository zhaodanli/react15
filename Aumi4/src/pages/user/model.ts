import { useRequest } from 'ahooks';
import { getUser } from '@/services/user';

export default () => {
    const { data, loading, refresh } = useRequest(getUser);

    console.log('data', data)
    return {
        data,
        refresh,
        loading
    };
};