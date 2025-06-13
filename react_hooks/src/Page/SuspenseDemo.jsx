import React, { Component, Suspense } from 'react'
import ErrorBoundary from "./ErrorBoundary";
// import Suspense from './Suspense'

function createResource(promise) {
    let status = 'pending';
    let result;
    return {
        read() {
            if (status === 'success' || status === 'error') {
                return result;
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
        setTimeout(() => {
            resolve({ success: true, data: { id, name: '张三' } });
            // reject({success:false,message:'获取数据发生了错误'});
        }, 1000);
    });
}

const initialResource = createResource(fetchData(1));

function User() {
    const result = initialResource.read();
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
                <Suspense fallback={<h1>加载中</h1>}>
                    <User />
                </Suspense>
            </ErrorBoundary>
        );
    }
}