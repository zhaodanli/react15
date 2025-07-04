import React from 'react';
import Link from "next/link";
import UserLayout from "./";
import request from '@/utils/request';

class UseList extends React.Component {
    constructor(props) {
        super(props);
        console.log('UseList constructor');
    }
    render() {
        console.log('UseList render');
        return (
            <UserLayout>
                <ul>
                    {this.props.list?.map((user) => (
                        <li key={user.id}>
                            <Link href={`/user/detail/${user.id}`}>{user.name}</Link>
                        </li>
                    ))}
                </ul>
            </UserLayout>
        );
    }
}

// 获取属性 UseList.loadData 在组件里定义好，在服务器端获取数据
UseList.getInitialProps = async () => {
    console.log('UseList getInitialProps');
    let response = await request({ url: '/api/users', method: 'GET' }).then(res => res.data);
    return { list: response.data };
    // let list = [
    //     { id: 1, name: "张三" },
    //     { id: 2, name: "李四" },
    // ];
    // return { list };
};
export default UseList;