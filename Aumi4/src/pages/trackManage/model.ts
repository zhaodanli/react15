import { useRequest } from 'ahooks';
import { queryPageList } from '@/services/PageController';

export default () => {

    const { data, loading, refresh } = useRequest(queryPageList);

    return {
        data,
        refresh,
        loading
    }
}