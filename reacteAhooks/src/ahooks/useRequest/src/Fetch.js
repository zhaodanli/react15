import { isFunction } from '../../utils';
class Fetch {
    count = 0; // 取消请求用
    constructor(serviceRef, options, subscribe, initState = {}) {
        this.serviceRef = serviceRef;
        this.options = options;
        this.subscribe = subscribe;
        // 非手动自动为true
        this.state = { loading: !options.manual, data: undefined, error: undefined, params: undefined, ...initState };
    }
    setState = (s = {}) => {
        this.state = { ...this.state, ...s };
        this.subscribe();
    }
    runAsync = async (...params) => {
        this.count += 1;
        const currentCount = this.count;
        const { ...state } = this.runPluginHandler('onBefore', params);
        // const { stopNow = false, returnNow = false, ...state } = this.runPluginHandler('onBefore', params);
        // if (stopNow) {
        //     return new Promise(() => { });
        // }
        this.setState({ loading: true, params });
        // this.setState({ loading: true, params, ...state });
        // if (returnNow) {
        //     return Promise.resolve(state.data);
        // }
        this.options.onBefore?.(params);
        try {
            let { servicePromise } = this.runPluginHandler('onRequest', this.serviceRef.current, params);
            if (!servicePromise) {
                servicePromise = this.serviceRef.current(...params);
            }
            const res = await servicePromise;
            // 是否被取消请求
            if (currentCount !== this.count) {
                return new Promise(() => { });
            }
            this.setState({ loading: false, data: res, error: undefined, params });
            this.options.onSuccess?.(res, params);
            this.runPluginHandler('onSuccess', res, params);
            this.options.onFinally?.(params, res, undefined);
            if (currentCount === this.count) {
                this.runPluginHandler('onFinally', params, res, undefined);
            }
        } catch (error) {
            // 是否被取消请求
            if (currentCount !== this.count) {
                return new Promise(() => { });
            }
            this.setState({ loading: false, error, params });
            this.options.onError?.(error, params);
            this.runPluginHandler('onError', error, params);
            this.options.onFinally?.(params, undefined, error);
            if (currentCount === this.count) {
                this.runPluginHandler('onFinally', params, undefined, error);
            }
            throw error;
        }
    }
    run = (...params) => {
        this.runAsync(...params).catch(error => {
            if (!this.options.onError) {
                console.error(error);
            }
        });
    }
    refresh() {
        this.run(...(this.state.params || []));
    }

    refreshAsync() {
        return this.runAsync(...(this.state.params || []));
    }

    // 立即更新函数
    mutate(data) {
        let targetData;

        if (isFunction(data)) {
            targetData = data(this.state.data);
        } else {
            targetData = data;
        }
        this.runPluginHandler('onMutate', targetData);
        this.setState({
            data: targetData
        });
    }

    cancel() {
        this.count += 1;
        this.setState({
            loading: false
        });
        this.options.onCancel?.();
        this.runPluginHandler('onCancel');
    }

    // 插件运行处理器
    runPluginHandler(event, ...rest) {
        // this.pluginImpls 插件实现 event: onbefore
        const r = this.pluginImpls.map(i => i[event]?.(...rest)).filter(Boolean);
        return Object.assign({}, ...r);
    }
}
export default Fetch;