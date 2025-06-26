import React, { useState, useRef } from 'react';
import { useRequest } from './ahooks';

let success = true;

function getName(userId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // resolve(xing + '三');
            // reject(new Error('获取用户名失败'));
            if (success) {
                resolve(`name${userId ? userId : ''}`);
            } else {
                reject(new Error('获取用户名失败'));
            }
            success = !success;
        }, 1000);
    });
}

const initialUserId = '1';
let updateSuccess = true;
function updateName(username) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (updateSuccess) {
                resolve(username);
            } else {
                reject(new Error(`修改用户名失败`));
            }
            updateSuccess = !updateSuccess;
        }, 1000);
    });
}
function App() {
    const lastRef = useRef();
    const [userId, setUserId] = useState(initialUserId);

    // useRequest 提供了mutate, 支持立即修改useRequest返回的data参数
    // // mutate的用法与React.setState一致，支持mutate(newData)和mutate((oldData) => newData)两种写法
    const { data , loading, error, run, runAsync, refresh, refreshAsync, mutate  } = useRequest(updateName, {
        manual: false,
        defaultParams: [initialUserId],
        onBefore: (params) => {
            console.info(`开始请求: ${params[0]}`);
        },
        onSuccess: (result, params) => {
            setUserId("");
            console.log(`用户名成功变更为 "${params[0]}" !`);
        },
        onError: (error, params) => {
            console.error(error.message);
            mutate(lastRef.current);
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
            <button onClick={() => {
                lastRef.current = userId;
                mutate(data);
                run(data);
            }} type="button">
                {loading ? "更新中......." : '立即更新'}
            </button>
            <button disabled={loading} onClick={() => run(userId)}>
                {loading ? '获取中......' : 'run'}
            </button>
            <button disabled={loading} onClick={() => runAsync('钱')}>
                {loading ? '获取中......' : 'runAsync'}
            </button>
            <button onClick={refresh} >
                refresh
            </button>
            <button onClick={refreshAsync} >
                refreshAsync
            </button>
            {data && <div>用户名: {data}</div>}
        </>
    )
};
export default App;