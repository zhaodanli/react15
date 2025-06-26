import useLatest from '../../useLatest';
import useUpdate from '../../useUpdate';
import useCreation from '../../useCreation';
import useMount from '../../useMount';
import Fetch from './Fetch';

// 请求实现钩子
function useRequestImplement(service) {
    // useLatest返回当前最新值的 Hook，可以避免闭包问题
    const serviceRef = useLatest(service);
    // useUpdate会返回一个函数，调用该函数会强制组件重新渲染
    const update = useUpdate();
    // useCreation 是 useMemo 或 useRef 的替代品
    // 因为 useMemo 不能保证被 memo 的值一定不会被重计算，而 useCreation 可以保证这一点
    const fetchInstance = useCreation(() => {
        return new Fetch(serviceRef, update);
    }, []);

    // useMount是只在组件初始化时执行的 Hook src\ahooks\useMount\index.js
    useMount(() => {
        fetchInstance.run();
    });
    return {
        loading: fetchInstance.state.loading,
        data: fetchInstance.state.data
    };
}

export default useRequestImplement;