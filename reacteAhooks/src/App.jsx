import React, { useState } from 'react';
import { useRequest } from './ahooks';

let success = true;

function getName(userId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // resolve(xing + '三');
            // reject(new Error('获取用户名失败'));
            if (success) {
                resolve(`name${userId}`);
            } else {
                reject(new Error('获取用户名失败'));
            }
        }, 1000);
    });
}

const initialUserId = '1';
function App() {
    const [userId, setUserId] = useState(initialUserId);

    const { data, loading, error, run, runAsync } = useRequest(getName, {
        manual: false,
        defaultParams: [initialUserId],
        onBefore: (params) => {
            console.info(`开始请求: ${params[0]}`);
        },
        onSuccess: (result, params) => {
            console.info(`请求成功:获取${params[0]}对应的用户名成功:${result}"!`);
        },
        onError: (error) => {
            console.error(`请求失败:${error.message}"!`);
        },
        onFinally: (params, result, error) => {
            console.info(`请求完成`);
        },
        /* onError(error) {
          console.error('onError', error);
        } */
    });
    return (
        <>
            <input
                onChange={(event) => setUserId(event.target.value)}
                value={userId}
                placeholder="请输入用户ID"
            />
            <button disabled={loading} onClick={() => run(userId)}>
                {loading ? '获取中......' : 'run'}
            </button>
            <button disabled={loading} onClick={() => runAsync('钱')}>
                {loading ? '获取中......' : 'runAsync'}
            </button>
            {data && <div>用户名: {data}</div>}
        </>
    )
};

export default App;