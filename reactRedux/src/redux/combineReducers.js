/**
 * 
 * @param {{counter1, counter2}} reducers 
 * @returns 
 */
function combineReducers(reducers){
    return function combination(state={}, action){
       let nextState = {};
       for(let key in reducers){//key=x
        //此key的老状态
        let nextStateForKey = state[key];
        //此key的reducer函数
        let reducerForKey = reducers[key];
        //把这个key老的状态和动作传给这个key对应的reducer函数，计算出新状态，然后赋值给nextState的这个key属性
        nextState[key] = reducerForKey(nextStateForKey, action);
       }
       return nextState;
    }
}
export default combineReducers;