import { RequestConfig } from '@umijs/max'
// 错误处理

import { notification, message } from 'antd';
import { history } from '@umijs/max';

// jsonwebtoken 用于解码JWT（JSON Web Token）。
import { decode } from 'jsonwebtoken';

// 后段返回错误级别
enum ErrorShowType {
    SILENT = 0, // 忽略 无动作
    WARN_MESSAGE = 1, // 警告
    ERROR_MESSAGE = 2, // 错误
    NOTIFICATION = 3 // 提示
}

// 这个函数用于抛出业务错误。当响应的 success 字段为 false 时，构建一个自定义的错误对象并抛出，包含错误信息和代码。
const errorHandler = (error: any) => {
    if (error.name === 'BizError') {
        const errorInfo = error.info;
        if (errorInfo) {
            const { errorMessage, errorCode, showType } = errorInfo;
            switch (showType) {
                case ErrorShowType.SILENT: // 不做任何处理。
                    break;
                case ErrorShowType.WARN_MESSAGE: // 以警告的方式显示消息
                    message.warn(errorMessage);
                    break;
                case ErrorShowType.ERROR_MESSAGE: // 以错误的方式显示消息。
                    message.error(errorMessage);
                    break;
                case ErrorShowType.NOTIFICATION: // 显示一个通知弹窗。
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
    // 拿到响应数据
    const { success, data, errorCode, errorMessage } = res;

    // 请求成功但后端返回的 success 为 false，就意味着虽然 HTTP 请求成功接受，但业务逻辑上出现了问题。此时，errorThrower 自己构建一个自定义错误并抛出，以供上层捕获和处理
    if (!success) {
        // 自己构建错误
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, data };
        throw error;
    }
}

export const request: RequestConfig = {
    timeout: 3000, // 请求超时为 3000 毫秒。
    headers: {
        ['Content-Type']: 'application/json', // 请求头：设置内容类型为 JSON。
        ['Accept']: 'application/json',
        credentials: 'include', // 它用于配置跨域请求时是否带上凭据（如 cookies）。当你设置为 include 时，无论请求是否跨域，都会发送 credentials，可用于实现客户端与服务器之间的身份验证。
    },

    // 错误配置 错误配置：指定错误处理与抛出函数。
    errorConfig: {
        errorThrower, // 抛出错误异常
        errorHandler
    },

    // 请求拦截器：在每个请求中添加 JWT 令牌到请求头
    requestInterceptors: [(url, options) => {
        const token = localStorage.getItem('token');
        if (token) {
            options.headers = options.headers || {};
            options.headers.authorization = token
        }
        return { url, options }
    }],

    // 响应拦截器
    responseInterceptors: [( response, options ) => {
        return response.data;
    }]
};


// ========================= 用户注册逻辑 ========================
interface InitialState {
    currentUser: API.User | null
}

// 这个函数用于获取初始状态，通常是在应用加载时执行。它检查 localStorage 中是否存在 JWT 令牌，并如果存在，解码出当前用户信息。
export async function getInitialState() {
    let initialState: InitialState = {
        currentUser: null
    }
    const token = localStorage.getItem('token');
    if (token) {
        initialState.currentUser = decode(token)
    }
    return initialState;
}

// 这个函数定义了布局配置，特别是需要用户登录才能访问的页面的权限控制。
export const layout = ({ initialState }) => {
    return {
        title: 'UMI4',
        logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
        onPageChange(location) {
            const { currentUser } = initialState;
            if (!currentUser && location.pathname !== '/signin') {
                history.push('/signup');
            }
        }
    };
};