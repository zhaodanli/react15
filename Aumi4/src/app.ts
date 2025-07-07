import { RequestConfig } from '@umijs/max'
// 错误处理

import { notification, message } from 'antd';
import { history } from '@umijs/max';

// 后段返回错误级别
enum ErrorShowType {
    SILENT = 0, // 忽略 无动作
    WARN_MESSAGE = 1, // 警告
    ERROR_MESSAGE = 2, // 错误
    NOTIFICATION = 3 // 提示
}

const errorHandler = (error: any) => {
    console.log('error', error)
    if (error.name === 'BizError') {
        const errorInfo = error.info;
        if (errorInfo) {
            const { errorMessage, errorCode, showType } = errorInfo;
            switch (errorInfo.showType) {
                case ErrorShowType.SILENT:
                    break;
                case ErrorShowType.WARN_MESSAGE:
                    message.warn(errorMessage);
                    break;
                case ErrorShowType.ERROR_MESSAGE:
                    message.error(errorMessage);
                    break;
                case ErrorShowType.NOTIFICATION:
                    notification.open({
                        description: errorMessage,
                        message: errorCode,
                    });
                    break;
                default:
                    message.error(errorMessage);
            }
        }
    } else if (error.response) {
        message.error(`响应状态码:${error.response.status}`);
    } else if (error.request) {
        message.error('没有收到响应');
    } else {
        message.error('请求发送失败');
    }
};

// 抛出错误异常 （请求成功，业务上请求错误）
const errorThrower = (res: any) => {
    console.log('errorThrower', res)
    // 拿到响应数据
    const { success, data, errorCode, errorMessage } = res;

    if (!success) {
        // 自己构建错误
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, data };
        throw error;
    }
}

export const request: RequestConfig = {
    timeout: 3000,
    headers: {
        ['Content-Type']: 'application/json',
        ['Accept']: 'application/json',
        credentials: 'include'
    },

    // 错误配置
    errorConfig: {
        errorThrower, // 抛出错误异常
        errorHandler
    },

    // 请求拦截器
    requestInterceptors: [(url, options) => {
        console.log('requestInterceptors', url, options)
        return { url, options }
    }],

    // 响应拦截器
    responseInterceptors: [(response, options) => {
        console.log('responseInterceptors', response, options)
        return response.data;
    }]
};


// ========================= 用户注册逻辑 ========================
interface InitialState {
    currentUser: API.User | null
}

export async function getInitialState() {
    let initialState: InitialState = {
        currentUser: null
    }
    return initialState;
}

export const layout = ({ initialState }) => {
    return {
        title: 'UMI4',
        logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
        // onPageChange(location) {
        //     const { currentUser } = initialState;
        //     if (!currentUser && location.pathname !== '/signin') {
        //         history.push('/signup');
        //     }
        // }
    };
};