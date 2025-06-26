class Fetch {
    constructor(serviceRef, options, subscribe) {
        this.serviceRef = serviceRef;
        this.options = options;
        this.subscribe = subscribe;
        this.state = { loading: false, data: undefined, error: undefined };
    }

    setState = (state = {}) => {
        this.state = { ...this.state, ...state };
        this.subscribe();
    }

    runAsync = async () => {
        this.setState({ loading: true });
        try {
            const res = await this.serviceRef.current();
            this.setState({ loading: false, data: res });
        } catch (error) {
            this.setState({ loading: false, error });
            this.options.onError?.(error);
            throw error;
        }
    }

    run = () => {
        this.runAsync().catch(error => {
            if (!this.options.onError) {
                console.error(error);
            }
        });;
    }
}
export default Fetch;