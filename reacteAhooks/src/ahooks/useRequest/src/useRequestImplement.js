import useLatest from '../../useLatest';
import useUpdate from '../../useUpdate';
import useCreation from '../../useCreation';
import useMount from '../../useMount';
import Fetch from './Fetch';
// 取消请求
import useUnmount from '../../useUnmount';

// 手动触发 useMemoizedFn是持久化 function 的 Hook，理论上，可以使用 useMemoizedFn 完全代替 useCallback
import useMemoizedFn from '../../useMemoizedFn';

// 请求实现钩子
function useRequestImplement(service, options = {}, plugins = []) {
    const { manual = false, ...rest } = options;
    const fetchOptions = { manual, ...rest };


    // useLatest返回当前最新值的 Hook，可以避免闭包问题
    const serviceRef = useLatest(service);
    // useUpdate会返回一个函数，调用该函数会强制组件重新渲染
    const update = useUpdate();
    // useCreation 是 useMemo 或 useRef 的替代品
    // 因为 useMemo 不能保证被 memo 的值一定不会被重计算，而 useCreation 可以保证这一点
    const fetchInstance = useCreation(() => {
        // return new Fetch(serviceRef, update);
        // 老的 options 给 onInit 执行，返回 { name } initState = [], 留下返回值不为空数组
        const initState = plugins.map(p => p?.onInit?.(fetchOptions)).filter(Boolean);
        // 把插件返回的初始状态累加
        return new Fetch(serviceRef, fetchOptions, update, Object.assign({}, ...initState));
    }, []);

    //fetchInstance.options = fetchOptions;
    // 添加插件实现， 每个插件是个函数，接收 实例 和 fetchOptions
    fetchInstance.pluginImpls = plugins.map(p => p(fetchInstance, fetchOptions));

    // useMount是只在组件初始化时执行的
    useMount(() => {
        if (!manual) {
            const params = fetchInstance.state.params || options.defaultParams || [];
            fetchInstance.run(...params);
        }
    });

    // 取消请求
    useUnmount(() => {
        fetchInstance.cancel();
    });
    return {
        loading: fetchInstance.state.loading,
        data: fetchInstance.state.data,
        error: fetchInstance.state.error,
        run: useMemoizedFn(fetchInstance.run.bind(fetchInstance)),
        runAsync: useMemoizedFn(fetchInstance.runAsync.bind(fetchInstance)),
        refresh: useMemoizedFn(fetchInstance.refresh.bind(fetchInstance)),
        refreshAsync: useMemoizedFn(fetchInstance.refreshAsync.bind(fetchInstance)),
        mutate: useMemoizedFn(fetchInstance.mutate.bind(fetchInstance)),
        cancel: useMemoizedFn(fetchInstance.cancel.bind(fetchInstance)),
        params: fetchInstance.state.params || [],
    };
}

export default useRequestImplement;