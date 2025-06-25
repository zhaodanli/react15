import { createSlice } from '../'
import { useEffect, useContext, useReducer } from 'react';
import { ReactReduxContext } from 'react-redux';


/** 这段代码实现了一个简单的 API 抽象层，利用 Redux 和 React 的功能来处理 API 请求。
 * 具体来说，它定义了一个 createApi 函数，可以用来创建一个 API 服务，并且支持查询（query）功能。以下是对这段代码的详细解释：
 * 
 */
// 定义一个字符串常量 FETCH_DATA，用于识别从 API 获取数据的动作类型。
const FETCH_DATA = 'FETCH_DATA';


/** fetchBaseQuery 是一个返回异步函数的高阶函数，通常用于执行基于 Fetch API 的 HTTP 请求。
 * 
 * @param {接受一个包含 baseUrl 的对象。} baseUrl 
 * @returns 返回一个接受 url 的异步函数，该函数将 baseUrl 和 url 拼接后进行 fetch 请求，获取 JSON 数据并返回。这种设计使得 API 请求的基础 URL 可以被复用。
 */
function fetchBaseQuery({ baseUrl }) {
    return async function (url) {
        url = baseUrl + url;
        let data = await fetch(url).then(res => res.json());
        return data;
    }
}

/**
 * 
 * @param {指明在 Redux store 中存储数据的路径} reducerPath  'todosApi'
 * @param {一个执行实际请求的函数（如上面的 fetchBaseQuery）} baseQuery （如上面的 fetchBaseQuery）
 * @param {*} endpoints 用于定义 API 的多个端点
 * @returns 
 * createApi({
     reducerPath: 'todosApi',
     baseQuery: axiosBaseQuery({ baseUrl: 'http://localhost:8080' }),
     endpoints: (builder) => {
         return {
             // 从参数生成查询参数 转变响应并且缓存
             getTodos: builder.query({ query: (id) => `/todos/detail/${id}` }),
         }
     }
 })
 */
function createApi({ reducerPath, baseQuery, endpoints }) {
    // builder 对象有一个 query 方法，返回一个 useQuery 钩子。这个钩子接受一个参数 id，用于生成 API 请求的 URL。
    let builder = {
        query(options) {
            function useQuery(id) {
                // 使用 ReactReduxContext 来获取 Redux store，并用 useReducer 触发组件的更新。
                const { store } = useContext(ReactReduxContext)
                const [, forceUpdate] = useReducer(x => x + 1, 0);
                useEffect(() => {
                    let url = options.query(id);
                    // 生成 URL 后将其派发给 Redux store，触发 FETCH_DATA 动作并设置监听器来更新组件。
                    store.dispatch({ type: FETCH_DATA, payload: { url } });
                    return store.subscribe(forceUpdate);
                }, [id, store])
                let state = store.getState();
                return state ? state[reducerPath] : {};
            }
            return { useQuery };
        }
    }

    // 使用 createSlice 函数创建一个 Redux slice，它将拥有 data、error 和 isLoading 状态。
    // 定义一个 reducer 函数 setValue，用于更新状态，这里使用了遍历方式将 payload 里的键值对更新到 state 中。
    let slice = createSlice({
        name: reducerPath,
        initialState: { data: null, error: null, isLoading: false },
        reducers: {
            setValue(state, { payload = {} }) {
                for (let key in payload)
                    state[key] = payload[key];
            }
        }
    });

    // API 对象构建
    // 包含创建的 slice 相关信息、Endpoints 和一个中间件，用于处理发往 Redux store 的 FETCH_DATA 动作。
    const { actions, reducer } = slice
    let api = {
        reducerPath,
        endpoints: endpoints(builder),
        reducer,
        middleware: function ({ dispatch }) {
            return function (next) {
                return function (action) {
                    // 中间件：
                    // 当 Redux 接收到一个类型为 FETCH_DATA 的 action 时，它会用 baseQuery 函数发起 API 请求。
                    // 使用 dispatch 更新 loading 状态、接收数据和处理错误，确保 Redux store 中的状态是准确的。
                    if (action.type === FETCH_DATA) {
                        let { url } = action.payload;
                        ; (async function () {
                            try {
                                dispatch(actions.setValue({ isLoading: true }));
                                let data = await baseQuery(url);
                                dispatch(actions.setValue({ data, isLoading: false }));
                            } catch (error) {
                                console.log(error);
                                console.log(typeof error);
                                dispatch(actions.setValue({ error: { error: error.toString() }, isLoading: false }));
                            }
                        })();
                    } else {
                        next(action);
                    }
                }
            }
        }
    }
    return api;
}

export { fetchBaseQuery, createApi }