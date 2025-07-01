import { useRequest } from 'ahooks';
import { queryEventList } from '@/services/EventController';

export default () => {

    const { data, loading, refresh } = useRequest(queryEventList);

    return {
        data,
        refresh,
        loading
    }
}