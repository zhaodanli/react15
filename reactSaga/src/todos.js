// React entry point 会自动根据 endpoints 生成 hooks
import { createApi, fetchBaseQuery } from './toolkit/query/react'
import axios from 'axios'


/** 这两段代码展示了如何使用 Redux Toolkit Query 来定义 API 服务的两种方式，尽管它们目标相似，但实现方式有所不同。下面是每段代码的解释，以及它们的区别和解决的问题。
 */
axios.interceptors.response.use(function (response) {
    return { data: response.data }; // 成功的响应体
}, function (error) { // 失败
    // 通过一个 axios 的响应拦截器自定义了错误的处理方式。拦截器返回了更易于管理的错误格式。
    return { error: { error: error.message } };
});

// 需要更多自定义请求和响应处理的场景，比如需要拦截、修改请求头、处理来自服务器的复杂错误响应等情形。
// 提供了更清晰和结构化的错误处理逻辑，使得错误更容易被组件和应用程序的其他部分使用和管理。
// 使用了 axios 进行请求，并手动创建了一个 axiosBaseQuery 函数。
// 在这个函数中，使用了 axios 进行 HTTP 请求，且配置了响应拦截器来处理响应同时增强错误处理的灵活性。
const axiosBaseQuery = ({ baseUrl }) => (
    async (url) => {
        try {
            const result = await axios({ url: baseUrl + url })
            return result;
        } catch (error) {
            return error;
        }
    }
)

// 使用 base URL 和 endpoints 定义服务
// fetchBaseQuery，是 Redux Toolkit Query 提供的一个内置的基本查询工具
// 简化了基于 Fetch API 的请求，处理请求和响应的逻辑。
const todosApi = createApi({
    reducerPath: 'todosApi',
    // baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8080' }),
    baseQuery: axiosBaseQuery({ baseUrl: 'http://localhost:8080' }),
    endpoints: (builder) => {
        return {
            // 从参数生成查询参数 转变响应并且缓存
            getTodos: builder.query({ query: (id) => `/todos/detail/${id}` }),
        }
    }
})

//导出可在函数式组件使用的hooks,它是基于定义的endpoints自动生成的
//export const { useGetTodosQuery } = todosApi
export default todosApi;