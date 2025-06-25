//React entry point 会自动根据 endpoints 生成 hooks
import { createApi, fetchBaseQuery } from './toolkit/query/react'

//import { createApi, fetchBaseQuery } from './toolkit/query/react'
//使用 base URL 和 endpoints 定义服务
const todosApi = createApi({
    reducerPath: 'todosApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8080' }),
    endpoints: (builder) => {
        return {
            //从参数生成查询参数 转变响应并且缓存
            getTodos: builder.query({ query: (id) => `/todos/detail/${id}` }),
        }
    }
})
//导出可在函数式组件使用的hooks,它是基于定义的endpoints自动生成的
//export const { useGetTodosQuery } = todosApi
export default todosApi;