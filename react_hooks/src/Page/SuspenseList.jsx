
import React, { Component, Suspense, SuspenseList } from 'react'
import ErrorBoundary from "./ErrorBoundary";

function createResource(promise) {
    let status = 'pending';
    let result;
    return {
        read() {
            if (status === 'success') {
                return result;
            } else if (status === 'error') {
                throw new Error(result.message); // 让 ErrorBoundary 捕获
            } else {
                throw promise.then((data) => {
                    status = 'success';
                    result = data;
                }, (error) => {
                    status = 'error';
                    result = error;
                });
            }
        }
    }
}

function fetchData(id) {
    return new Promise((resolve, reject) => {
        console.log(id)
        setTimeout(() => {
            console.log('User result:');
            resolve({ success: true, data: { id, name: '姓名' + id } });
            // reject({success:false,message:'获取数据发生了错误'});
        }, 1000 * id);
    });
}

let userResourceMap = {
    1: createResource(fetchData(1)),
    2: createResource(fetchData(2)),
    3: createResource(fetchData(3))
}

function User(props) {
    const result = userResourceMap[props.id].read();
    console.log('User result:', result);
    if (result.success) {
        let user = result.data;
        return <p>{user.id}:{user.name}</p>;
    } else {
        return <p>{result.message}</p>;
    }
}

export default class extends Component {
    render() {
        return (
            <ErrorBoundary fallback={<h1>出错了</h1>}>
                <SuspenseList revealOrder="backwards" tail="collapsed" >
                    <Suspense fallback={<h1>加载用户3......</h1>}>
                        <User id={3} />
                    </Suspense>
                    <Suspense fallback={<h1>加载用户2......</h1>}>
                        <User id={2} />
                    </Suspense>
                    <Suspense fallback={<h1>加载用户1......</h1>}>
                        <User id={1} />
                    </Suspense>
                </SuspenseList>

            </ErrorBoundary>
        );
    }
}