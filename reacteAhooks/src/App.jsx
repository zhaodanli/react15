import { useRequest } from './ahooks';
import React from 'react';

function getName() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // resolve('zhufeng');
            reject(new Error('获取用户名失败'));
        }, 1000);
    });
}

function App() {
    const { data, loading, error } = useRequest(getName);
    if (loading) {
        return <div>加载中...</div>;
    }

    if (error) {
        return <div>加载失败</div>;
    }

    return <div>用户名: {data}</div>;
};

export default App;