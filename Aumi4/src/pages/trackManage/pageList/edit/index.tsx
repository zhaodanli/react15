import { Form, Input, Button, Row, Col } from 'antd';
export default function () {
    const onFinish = (values: any) => {
        console.log(values);
    };
    return (
        <Row >
            <Col offset={8} span={8}>
                <Form
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 20 }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        label="英文名称"
                        name="page_id"
                        rules={[{ required: true, message: '请输入英文名称' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="页面名称"
                        name="page_name"
                        rules={[{ required: true, message: '请输入页面名称' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="页面描述"
                        name="page_dsc"
                        rules={[{ required: true, message: '请输入页面描述' }]}
                    >
                        <Input.Password />
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