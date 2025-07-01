import { List } from 'antd';
import { Link, useModel } from '@umijs/max';

import { addUser, queryUserList, deleteUser, modifyUser } from '@/services/UserController';

export default function () {

    const requestFn = async (params, sorter, filter) => {
        const { data, success } = await queryUserList({
            ...params,
            // FIXME: remove @ts-ignore
            // @ts-ignore
            sorter,
            filter,
        });
        console.log(data)
        return {
            data: data || [],
            success,
        };
    }
    const userList = requestFn(null, null, null).then((res) => {
        console.log(res)
    })

    const { data, loading } = useModel('user.model');

    return (
        <List
            header={<div>用户列表</div>}
            footer={<div>共计{data?.list?.length}</div>}
            bordered
            dataSource={data?.list}
            renderItem={(user: any) => (
                <List.Item>
                    <Link to={`/user/detail/${user.id}`} state={user}> {user.username}</Link>
                </List.Item>
            )}
        />
    );
}