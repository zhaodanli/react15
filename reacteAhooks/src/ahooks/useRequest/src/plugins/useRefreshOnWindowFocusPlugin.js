import { useEffect, useRef } from 'react';
import useUnmount from '../../../useUnmount';
import limit from '../utils/limit';
import subscribeFocus from '../utils/subscribeFocus';

const useRefreshOnWindowFocusPlugin = (fetchInstance, {
  refreshOnWindowFocus,
  focusTimespan = 5000
}) => {
  const unsubscribeRef = useRef();

  // 取消订阅方法
  const stopSubscribe = () => {
    unsubscribeRef.current?.();
  };

  useEffect(() => {
    // 订阅事件
    if (refreshOnWindowFocus) {
      // 添加节流
      const limitRefresh = limit(fetchInstance.refresh.bind(fetchInstance), focusTimespan);
      unsubscribeRef.current = subscribeFocus(() => limitRefresh());
    }

    // 取消订阅
    return () => {
      stopSubscribe();
    };
  }, [refreshOnWindowFocus, focusTimespan]);

  // 取消订阅
  useUnmount(() => {
    stopSubscribe();
  });
  return {};
};

export default useRefreshOnWindowFocusPlugin;