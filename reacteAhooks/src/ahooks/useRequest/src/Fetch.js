class Fetch {
    constructor(serviceRef, subscribe) {
        this.serviceRef = serviceRef;
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
        }
    }

    run = () => {
        this.runAsync();
    }
}
export default Fetch;