export default ({
    namespace: 'counter2',

    state: { number: 0 },
    
    reducers: {//接收老状态，返回新状态
        add(state) { //dispatch({type:'add'});
            return { number: state.number + 1 };
        },
        minus(state) {//dispatch({type:'minus'})
            return { number: state.number - 1 };
        }
    }
});