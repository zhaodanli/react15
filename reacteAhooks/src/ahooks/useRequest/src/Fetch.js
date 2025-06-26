class Fetch {
    constructor(serviceRef, subscribe) {
        this.serviceRef = serviceRef;
        this.subscribe = subscribe;
        this.state = { loading: false, data: undefined };
    }

    setState = (state = {}) => {
        this.state = { ...this.state, ...state };
        this.subscribe();
    }

    runAsync = async () => {
        this.setState({ loading: true });
        const res = await this.serviceRef.current();
        this.setState({ loading: false, data: res });
    }
    
    run = () => {
        this.runAsync();
    }
}
export default Fetch;