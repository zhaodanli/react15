import { List, Button, Space, Input } from 'antd';
import { useLocation } from '@umijs/max';
import { Link, useModel } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';

const { Search } = Input;
export default function (props: any) {
    const { data } = useModel('trackManage.eventList.model');

    return (
        <PageContainer>
            <Space direction="horizontal" style={{ marginBottom: '20px' }}>
                <Space.Compact>
                    <Search placeholder="点击事件" enterButton="Search" style={{ marginRight: '20px' }} />
                    <Button type="primary" size='small'>新增页面</Button>
                </Space.Compact>
            </Space>
            <List
                header={<div>事件信息</div>}
                footer={<div>共计{data?.list?.length}条数据</div>}
                bordered
                dataSource={data?.list}
                renderItem={(item: any) => (
                    <Link to={`/trackManage/eventList/${item.page_id}`} state={data}>
                        <List.Item>
                            <List.Item.Meta
                                title={`${item?.event_name}`}
                                description={`${item?.dsc}`}
                            />
                            <div>
                                <Space>
                                    <Button type="primary">新增事件</Button>
                                    <Button type="primary">编辑</Button>
                                    <Button type="primary">查看</Button>
                                </Space>
                            </div>
                        </List.Item>
                    </Link>
                )}
            />
        </PageContainer>
    );
}