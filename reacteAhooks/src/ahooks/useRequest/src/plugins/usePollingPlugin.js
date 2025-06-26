import { useRef } from 'react';
import useUpdateEffect from '../../../useUpdateEffect';
import isDocumentVisible from '../utils/isDocumentVisible';
import subscribeReVisible from '../utils/subscribeReVisible';

/**
 * 
 * @param {*} fetchInstance 
 * @param {是否隐藏轮询} pollingWhenHidden 
 * @returns 
 */
const usePollingPlugin = (fetchInstance, { pollingInterval, pollingWhenHidden = true }) => {
    const timerRef = useRef();
    const unsubscribeRef = useRef();

    // 取消轮询
    const stopPolling = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        unsubscribeRef.current?.();
    };

    useUpdateEffect(() => {
        // 没有值取消轮询
        if (!pollingInterval) {
            stopPolling();
        }
    }, [pollingInterval]);

    if (!pollingInterval) {
        return {};
    }

    return {
        // 请求前设置定时器，在时间到后变成true, 当前的loding先设为true
        onBefore: () => {
            // 请求开始前取消轮询
            stopPolling();
        },
        onFinally: () => {
            // pollingWhenHidden === false  并且 ！isDocumentVisible 页面不可见 不轮询
            if (!pollingWhenHidden && !isDocumentVisible()) {
                unsubscribeRef.current = subscribeReVisible(() => {
                    fetchInstance.refresh();
                });
                return;
            }

            // 请求后刷新定时器 实现轮询
            timerRef.current = setTimeout(() => {
                fetchInstance.refresh();
            }, pollingInterval);
        },
        onCancel: () => {
            // 请求开始前取消轮询
            stopPolling();
        }
    };
};
export default usePollingPlugin;