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
    const { data, loading, error, run, runAsync } = useRequest(getName, {
        manual: true,
        /* onError(error) {
          console.error('onError', error);
        } */
    });
    return (
        <>
            <button disabled={loading} onClick={run}>
                {loading ? '获取中......' : 'run'}
            </button>
            <button disabled={loading} onClick={runAsync}>
                {loading ? '获取中......' : 'runAsync'}
            </button>
            {data && <div>用户名: {data}</div>}
        </>
    )
};

export default App;