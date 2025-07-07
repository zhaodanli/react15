import { Form, Input, Button, Card, Row, Col, Spin } from 'antd';
import { useRequest } from 'ahooks';
import { signin } from '@/services/auth';
import { useModel, history, Link } from '@umijs/max';
import { useEffect } from 'react';
// import { decode } from 'jsonwebtoken';

export default function () {
    // getInitialState 
    const { initialState, setInitialState } = useModel('@@initialState');
    // manual: true 表示请求不会自动执行，只有在触发时才会执行。请求成功后，将返回的 token 存入 localStorage，并解码出 currentUser 信息。
    const { loading, run } = useRequest(signin, {
        manual: true,
        onSuccess(result) {
            localStorage.setItem('token', JSON.stringify(result));
            // const currentUser = decode(result);
            const currentUser = result;
            setInitialState({ currentUser });
        }
    });
    useEffect(() => {
        if (initialState?.currentUser)
            history.push('/')
    }, [initialState]);
    const onFinish = (values: any) => {
        run(values);
    };
    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };
    return (
        <Row className='h-screen bg-gray-200' align='middle'>
            <Col offset={8} span={8} >
                <Card title="请登录" extra={<Link to="/signup">去注册</Link>}>
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
