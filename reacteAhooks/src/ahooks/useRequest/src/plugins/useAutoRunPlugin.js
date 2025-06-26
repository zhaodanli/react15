import { useRef } from 'react';
import useUpdateEffect from '../../../useUpdateEffect';

const useAutoRunPlugin = (fetchInstance, { 
    manual, 
    ready = true, 
    defaultParams = [], // 默认参数
    // 依赖部分
    refreshDeps = [],
    refreshDepsAction
}) => {
    // 用于识别依赖
    const hasAutoRun = useRef(false);
    hasAutoRun.current = false;
    useUpdateEffect(() => {
        // 自动模式 已就绪
        if (!manual && ready) {
            // 自动运行过为true
            hasAutoRun.current = true;
            // 运行
            fetchInstance.run(...defaultParams);
        }
    }, [ready]);

    // 钩子
    useUpdateEffect(() => {
        if (hasAutoRun.current) {
            return;
        }
        if (!manual) {
            hasAutoRun.current = true;
            if (refreshDepsAction) {
                refreshDepsAction();
            } else {
                // 刷新会使用上次的值
                fetchInstance.refresh();
            }
        }
    }, [...refreshDeps]);
    return {
        onBefore: () => {
            // 请求前 未就绪 stopNow 跳过当前请求
            if (!ready) {
                return {
                    stopNow: true
                };
            }
        }
    };
};


// 设置初始状态 state, 接入 ready是否就绪 默认 true, manual默认自动模式
useAutoRunPlugin.onInit = ({
    ready = true,
    manual
}) => {
    return {
        // 自动模式 ready true loading 为 true
        loading: !manual && ready
    };
};

export default useAutoRunPlugin;