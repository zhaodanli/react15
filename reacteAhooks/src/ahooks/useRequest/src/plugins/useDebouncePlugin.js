import { useEffect, useRef } from 'react';


/** 防抖函数
 * 
 * @param {*} fetchInstance 
 * @param {*} param1 
 * @returns 
 */
const useDebouncePlugin = (fetchInstance, { debounceWait }) => {
    const debouncedRef = useRef();
    useEffect(() => {
        // debounceWait 有值才需要防抖
        if (debounceWait) {
            // 原始方法
            const originRunAsync = fetchInstance.runAsync.bind(fetchInstance);
            debouncedRef.current = debounce(callback => callback(), debounceWait);
            // 重写 fetchInstance.runAsync
            fetchInstance.runAsync = (...args) => {
                return new Promise((resolve, reject) => {
                    debouncedRef.current?.(() => originRunAsync(...args).then(resolve).catch(reject));
                });
            };
        }
    }, [debounceWait]);
    return {};
};

function debounce(fn, wait) {
    let timer;
    return (...args) => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        timer = setTimeout(() => fn(...args), wait);
    }
}
export default useDebouncePlugin;