import { List } from 'antd';
import { Link } from '@umijs/max';

export default function () {
    const data = {
        list: [
            { id: 1, username: 'root' },
            { id: 2, username: 'admin' },
            { id: 3, username: 'member' }
        ]
    }
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