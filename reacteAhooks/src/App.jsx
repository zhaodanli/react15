import React, { useState, useRef } from 'react';
import { useRequest } from './ahooks';

function getName() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`zhufeng`);
        }, 1000);
    });
}
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
        }, 3000);
    });
}
function App() {
    const lastRef = useRef();
    const [value, setValue] = useState("");
    const { data: name, mutate } = useRequest(getName, { name: 'getName' });
    const { run, loading, cancel } = useRequest(updateName, {
        manual: true,
        name: 'updateName',
        onSuccess: (result, params) => {
            setValue("");
            console.log(`用户名成功变更为 "${params[0]}" !`);
        },
        onError: (error, params) => {
            console.error(error.message);
            setValue("");
            mutate(lastRef.current);
        },
        onCancel: () => {
            mutate(lastRef.current);
            setValue("");
        }
    });
    return (
        <>
            {name && <div>用户名: {name}</div>}
            <input
                onChange={(event) => setValue(event.target.value)}
                value={value}
                placeholder="请输入用户名"
            />
            <button onClick={() => {
                lastRef.current = name; // 更新前备份老的值
                mutate(value); // 先更新
                run(value); // 调用后台更新方法更新
            }} type="button">
                {loading ? "更新中......." : '更新'}
            </button>
            <button type="button" onClick={cancel}>
                取消
            </button>
        </>
    )
};
export default App;