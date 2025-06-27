
import { createStore, combineReducers, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import * as sagaEffects from 'redux-saga/effects';
import { connect, Provider } from 'react-redux';
import prefixNamespace from './prefixNamespace';
import { NAMESPACE_SEP } from './constants';

export { connect };

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import type { DvaInstance, Router, Model } from './typings';

export default function () {
    const app: DvaInstance = {
        _models: [],
        model,
        router,
        _router: null,
        start
    }

    const initialReducers = {};

    function model(model: Model) {
        const prefixedModel = prefixNamespace(model);
        app._models.push(prefixedModel);
        return prefixedModel;
    }

    function router(router: Router) {
        app._router = router;
    }

    function start() {
        const root = createRoot(document.getElementById('root')!)

        for (const model of app._models) {
            initialReducers[model.namespace] = getReducer(model);
        }
        let rootReducer = createReducer();

        // 处理 effect saga
        const sagas = getSagas(app);
        // 创建saga中间件
        const sagaMiddleware = createSagaMiddleware();
        // let store = createStore(rootReducer);
        let store = createStore(rootReducer, applyMiddleware(sagaMiddleware));
        // 启动监听
        sagas.forEach(saga => sagaMiddleware.run(saga));
        // <Provider store={store} > {app._router()} </Provider>, document.querySelector(root)
        root.render(
            <StrictMode>
                <Provider store={store} >
                    {app._router()}
                </Provider>
            </StrictMode>,
        )

        function createReducer() {
            return combineReducers(initialReducers);
        }
    }
    
    // ============= saga 相关 ==============
    function getSagas(app) {
        let sagas: Array<any> = [];
        for (const model of app._models) {
            sagas.push(getSaga(model.effects, model));
        }
        return sagas;
    }

    return app;
}

function getReducer(model) {
    let { reducers, state: defaultState } = model;
    let reducer = (state = defaultState, action) => {
        let reducer = reducers[action.type];
        if (reducer) {
            return reducer(state, action);
        }
        return state;
    }
    return reducer;
}

// ============= saga 相关 ==============
/**
 * 
 * @param effects effects 是一个包含需要处理的副作用的对象，通常是异步操作或副作用处理的函数。
 * @param model 通常是一个包含应用状态、命名空间、reducers、effects（副作用）等信息的对象。
 * @returns 
 */
function getSaga(effects, model) {
    return function* () {
        for (const key in effects) {
            // 创建一个 watcher（观察者）
            const watcher = getWatcher(key, model.effects[key], model);
            // fork 是 Redux-Saga 的一个效果，它允许我们在后台运行一个 saga，而不需要等待这个 saga 完成
            yield sagaEffects.fork(watcher);
        }
    };
}

// 生成 Watcher 用于监控特定的 effect。
function getWatcher(key, effect, model) {
    return function* () {
        // 使用 takeEvery 来监听 key（通常是一个 action type）每当监听到这个 action 时，都会触发执行 sagaWithCatch
        yield sagaEffects.takeEvery(
            key, 
            // sagaWithCatch 是一个生成器函数，它会执行传入的 effect，并传递任何 arguments。
            function* sagaWithCatch(...args) {
                yield effect(
                    ...args, 
                    { 
                        ...sagaEffects, 
                        // put 函数被重写，使它在 dispatch action 时能够自动为 action 的类型添加前缀（使用 prefixType 函数），这样可以避免 action type 冲突。
                        put: action => sagaEffects.put({ ...action, type: prefixType(action.type, model) }) 
                    }
                );
            }
        );
    };
}
function prefixType(type, model) {
    if (type.indexOf('/') === -1) {
        return `${model.namespace}${NAMESPACE_SEP}${type}`;
    }
    return type;
}

export * from './typings';