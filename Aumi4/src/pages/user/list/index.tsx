import { List } from 'antd';
import { Link, useModel } from '@umijs/max';

export default function () {
    const { data, loading } = useModel('user.model');

    console.log(data)

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