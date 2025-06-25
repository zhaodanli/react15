import { Provider } from 'react-redux';
import ToolkitQueryDemo from './components/ToolkitQueryDemo';

import { configureStore } from '@reduxjs/toolkit'
//import { configureStore } from './toolkit'
import todosApi from './todos'

// API slice会包含自动生成的redux reducer和一个自定义中间件
const store = configureStore({
    reducer: {
        [todosApi.reducerPath]: todosApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(todosApi.middleware)
})

export default function App() {
    return (
        <Provider store={store}>
            <ToolkitQueryDemo />
        </Provider>
    )
}





