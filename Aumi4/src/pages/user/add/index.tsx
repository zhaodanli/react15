import { Form, Input, Button, Row, Col } from 'antd';
import { useRequest } from 'ahooks';
import { addUser } from '@/services/user';
import { useNavigate, useModel } from '@umijs/max';
import { useEffect } from 'react';

export default function () {
    const navigate = useNavigate();
    const { refresh } = useModel('user.model');

    const { data, loading, run } = useRequest(addUser, {
        manual: true,
        onSuccess: refresh
    });

    const onFinish = (values: any) => {
        run(values);
    };

    useEffect(() => {
        if (data) {
            navigate('/user/list');
        }
    }, [data]);

    return (
        <Row >
            <Col offset={8} span={8}>
                <Form
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 20 }}
                    onFinish={onFinish}
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
                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button type="primary" htmlType="submit" >
                            提交
                        </Button>
                    </Form.Item>
                </Form>
            </Col>
        </Row>

    );
}