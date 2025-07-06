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
// UseList.getInitialProps = async () => {
//     console.log('UseList getInitialProps');
//     let response = await request({ url: '/api/users', method: 'GET' }).then(res => res.data);
//     return { list: response.data };
//     // let list = [
//     //     { id: 1, name: "张三" },
//     //     { id: 2, name: "李四" },
//     // ];
//     // return { list };
// };

/**
 * 
 * @returns 
 * @returns 每次请求时都会调用，数据在服务器端提取。
适用于需要频繁更新的数据。
首次请求会阻止页面渲染，直至数据准备完成。
 */
export const getServerSideProps = async () => {
    console.log('UseList getInitialProps');
    const res = await request.get('http://localhost:8080/api/users')
    return {
        props: {
            list: res.data.data
        },
    }
}


/**
 * 在构建时仅调用一次，适用于静态内容（如博客文章、产品列表等）。
可以与 getStaticPaths 一起使用以动态生成静态路径。
页面会在构建时生成 HTML，从而在客户端获得更好的性能。
 */
// export async function getStaticProps() {
//   const res = await request.get('http://localhost:8080/api/users');
//   return {
//     props: {
//       list: res.data.data
//     },
//   }
// }
export default UseList;