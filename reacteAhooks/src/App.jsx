import React, { useState, useRef } from 'react';
import { useRequest } from './ahooks';
let success = true;
function getName() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (success) {
                resolve(`zhufeng`);
            } else {
                reject(new Error('获取用户名失败'));
            }
            success = !success;
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
        }, 300);
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
            mutate(lastRef.current);
        },
        onCancel: () => {
            mutate(lastRef.current);
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
                lastRef.current = name;
                mutate(value);
                run(value);
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