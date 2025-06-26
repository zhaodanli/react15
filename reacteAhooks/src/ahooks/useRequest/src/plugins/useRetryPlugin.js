
import { useRef } from 'react';
const useRetryPlugin = (fetchInstance, {
    retryInterval,
    retryCount
}) => {
    const timerRef = useRef(); // 定时器
    const countRef = useRef(0); // 重试的次数
    const triggerByRetry = useRef(false); // 是否由重试触发

    if (!retryCount) {
        return {};
    }

    return {
        onBefore: () => {
            // 当前请求不是 重试请求，计数器为0
            if (!triggerByRetry.current) {
                countRef.current = 0;
            }

            triggerByRetry.current = false;

            // 取消
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        },
        onSuccess: () => {
            // 成功后 重置
            countRef.current = 0;
        },
        onError: () => {
            // 请求失败次数 加1
            countRef.current += 1;
            // 没有到达最大充实次数
            if (retryCount === -1 || countRef.current <= retryCount) {
                // 第一次充实1s后，2， 8， 16， 32s后
                const timeout = retryInterval ?? Math.min(1000 * 2 ** countRef.current, 30000);
                // 到达 timeout 重试
                timerRef.current = setTimeout(() => {
                    triggerByRetry.current = true;
                    fetchInstance.refresh();
                }, timeout);
            } else {
                countRef.current = 0;
            }
        },
        onCancel: () => {
            // 取消后 重置
            countRef.current = 0;
            // 取消
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        }
    };
};

export default useRetryPlugin;