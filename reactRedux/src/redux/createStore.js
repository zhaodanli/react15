const createStore = (reducer, preloadedState) => {
    let state = preloadedState;
    let listeners = [];

    function getState() {
        return state;
    }

    function dispatch(action) {
        state = reducer(state, action);
        listeners.forEach(l => l());
        return action;
    }

    function subscribe(listener) {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter(l => l !== listener);
        }
    }

    dispatch({ type: '@@REDUX/INIT' });
    return {
        getState,
        dispatch,
        subscribe
    }
}
export default createStore;