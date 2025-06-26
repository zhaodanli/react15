import { useRequest } from './ahooks';
import React from 'react';

function getName(xing) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(xing + '三');
            // reject(new Error('获取用户名失败'));
        }, 1000);
    });
}

function App() {
    const { data, loading, error, run, runAsync } = useRequest(getName, {
        manual: false,
        defaultParams: ['张']
        /* onError(error) {
          console.error('onError', error);
        } */
    });
    return (
        <>
            <button disabled={loading} onClick={() => run('赵')}>
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