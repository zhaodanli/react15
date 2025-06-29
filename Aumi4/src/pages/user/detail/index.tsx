import { Descriptions } from 'antd';
import { useLocation } from '@umijs/max';

export default function (props: any) {
    const location = useLocation();
    let user = location.state as API.User;

    return (
        <Descriptions title="用户信息">
            <Descriptions.Item label="用户ID">{user?.id}</Descriptions.Item>
            <Descriptions.Item label="用户名">{user?.username}</Descriptions.Item>
            <Descriptions.Item label="手机号">{user?.phone}</Descriptions.Item>
        </Descriptions>
    );
}