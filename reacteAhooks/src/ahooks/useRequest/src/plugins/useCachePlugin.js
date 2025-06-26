import { useRef } from 'react';
import * as cache from '../utils/cache';
import useCreation from '../../../useCreation';
// 共享缓存
import * as cachePromise from '../utils/cachePromise';
// 共享缓存 数据同步
import * as cacheSubscribe from '../utils/cacheSubscribe';

const useCachePlugin = (fetchInstance, {
    cacheKey,
    staleTime = 0, // 数据新鲜时间
    cacheTime = 5 * 60 * 1000,
    setCache: customSetCache,
    getCache: customGetCache
}) => {

    // 取消该订阅
    const unSubscribeRef = useRef();
    // 请求订阅
    const currentPromiseRef = useRef();

    // 写缓存
    const _setCache = (key, cachedData) => {
        // 自定义动作
        if (customSetCache) {
            customSetCache(cachedData);
        } else {
            cache.setCache(key, cacheTime, cachedData);
        }

        // 触发发送缓存
        cacheSubscribe.trigger(key, cachedData.data);
    };

    // 读缓存
    const _getCache = (key, params) => {
        // 自定义动作
        if (customGetCache) {
            return customGetCache(params);
        }
        return cache.getCache(key);
    };


    // 创建钩子， 只在挂载执行， 更新不执行
    useCreation(() => {
        if (!cacheKey) {
            return;
        }
        // 初次挂载
        const cacheData = _getCache(cacheKey);

        // 若果有值， 且有 data 属性
        if (cacheData && Object.hasOwnProperty.call(cacheData, 'data')) {
            fetchInstance.state.data = cacheData.data; // data赋值
            fetchInstance.state.params = cacheData.params; // params 赋值
            // 没过期 loading 为 false
            if (staleTime === -1 || new Date().getTime() - cacheData.time <= staleTime) {
                fetchInstance.state.loading = false;
            }
        }
    })

    if (!cacheKey) {
        return {};
    }

    return {
        onBefore: params => {
            // 读取数据
            const cacheData = _getCache(cacheKey, params);

            // 不存在 或者 没有 data
            if (!cacheData || !Object.hasOwnProperty.call(cacheData, 'data')) {
                return {};
            }

            //  数据新鲜时间 staleTime
            // staleTime === -1 表示永不过期， 或者 当前-缓存时间 <= 过期时间 === 保质期内
            if (staleTime === -1 || new Date().getTime() - cacheData.time <= staleTime) {
                return {
                    loading: false,
                    data: cacheData?.data,
                    returnNow: true
                };
            } else {
                return {
                    data: cacheData?.data
                };
            }
        },
        
        // 数据共享逻辑
        onRequest: (service, args) => {
            // 获取promise
            let servicePromise = cachePromise.getCachePromise(cacheKey);
            // 有promise 并且和当前不相等，用缓存
            if (servicePromise && servicePromise !== currentPromiseRef.current) {
                return {
                    servicePromise
                };
            }
            // 生成一个 servicePromise
            servicePromise = service(...args);
            // 保存 promise
            currentPromiseRef.current = servicePromise;
            // 缓存 promise
            cachePromise.setCachePromise(cacheKey, servicePromise);
            return {
                servicePromise
            };
        },
        onSuccess: (data, params) => {
            // 请求完成 放入缓存
            if (cacheKey) {
                _setCache(cacheKey, {
                    data, // 数据
                    params, // 参数
                    time: new Date().getTime() // 时间
                });

                // 订阅
                unSubscribeRef.current = cacheSubscribe.subscribe(cacheKey, d => {
                    fetchInstance.setState({
                        data: d
                    });
                });
            }
        }
    };
};
export default useCachePlugin;