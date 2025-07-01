import { List, Button, Space, Input } from 'antd';
import { Link, useModel, useNavigate } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';

/**
 * API.Page
 * @param props 
 * @returns 
 */
const { Search } = Input;
export default function (props: any) {
    const { data } = useModel('trackManage.model');
    const navigate = useNavigate();

    const goToEventList = () => {
        navigate('../eventList')
    }

    const handleEdit = (id) => {
        navigate(`edit?page_id=${id}`)
    }

    return (
        <PageContainer>
            <Space direction="horizontal" style={{ marginBottom: '20px' }}>
                <Space.Compact>
                    <Search placeholder="首页" enterButton="Search" style={{ marginRight: '20px' }} />
                    <Button type="primary" size='small'>新增事件</Button>
                </Space.Compact>
            </Space>
            <List
                header={<div>页面信息</div>}
                footer={<div>共计{data?.list?.length}条数据</div>}
                bordered
                dataSource={data?.list}
                renderItem={(item: any) => (
                    <List.Item>
                        <List.Item.Meta
                            title={`${item?.page_name}`}
                            description={`${item?.dsc}`}
                        />
                        <div>
                            <Space>
                                <Button type="primary" onClick={() => { handleEdit(item.page_id) }}>编辑</Button>
                                <Button type="primary" onClick={goToEventList}>查看</Button>
                            </Space>
                        </div>
                    </List.Item>
                )}
            />
        </PageContainer>
    );
}