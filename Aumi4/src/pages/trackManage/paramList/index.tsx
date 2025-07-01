import { Descriptions } from 'antd';
import { useLocation } from '@umijs/max';

export default function (props: any) {
    const location = useLocation();
    let user = location.state as API.PageList;
    
    return (
        <Descriptions title="参数列表">
            <Descriptions.Item label="用户ID">{user?.page_id}</Descriptions.Item>
            <Descriptions.Item label="用户名">{user?.name}</Descriptions.Item>
            <Descriptions.Item label="手机号">{user?.dsc}</Descriptions.Item>
        </Descriptions>
    );
}