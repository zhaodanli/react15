import { useRequest } from 'ahooks';
// import { getUser } from '@/services/user';

export default () => {

    // const { data, loading, refresh } = useRequest(getUser);
    return {
        data: {
            list: [
                { id: 1, username: 'root' },
                { id: 2, username: 'admin' },
                { id: 3, username: 'member' }
            ]
        },
        // refresh,
        // loading
    };
};