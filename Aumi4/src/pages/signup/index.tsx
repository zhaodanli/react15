import { Form, Input, Button, Card, Row, Col, Spin, Select } from 'antd';
import { useRequest } from 'ahooks';
import { signup } from '@/services/auth';
import { history, Link } from '@umijs/max';
import { ROLES } from '@/constants';

export default function () {
    const { loading, run } = useRequest(signup, {
        manual: true,
        onSuccess() {
            history.push('/signin')
        }
    });
    const onFinish = (values: any) => {
        run(values);
    };
    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <Row className='h-screen bg-gray-200' align='middle'>
            <Col offset={8} span={8} >
                <Card title="请登录" extra={<Link to="/signin">去登录</Link>}>
                    <Spin spinning={loading}>
                        <Form
                            labelCol={{ span: 4 }}
                            wrapperCol={{ span: 20 }}
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                        >
                            <Form.Item
                                label="用户名"
                                name="username"
                                rules={[{ required: true, message: '请输入用户名' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="密码"
                                name="password"
                                rules={[{ required: true, message: '请输入密码' }]}
                            >
                                <Input.Password />
                            </Form.Item>
                            <Form.Item
                                label="手机号"
                                name="phone"
                                rules={[{ required: true, message: '请输入手机号' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="角色"
                                name="role"
                                rules={[{ required: true, message: '请选择角色' }]}
                            >
                                <Select
                                >
                                    {
                                        ROLES.map(role => {
                                            return (
                                                <Select.Option value={role.code} key={role.code}>
                                                    {role.name}
                                                </Select.Option>
                                            )
                                        })
                                    }
                                </Select>
                            </Form.Item>
                            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                <Button type="primary" htmlType="submit" >
                                    提交
                                </Button>
                            </Form.Item>
                        </Form>
                    </Spin>
                </Card>
            </Col>
        </Row>
    );
}