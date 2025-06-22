/**
 * 
 * @param {add(){{ type: 'ADD' }}} actionCreator 
 * @param {store.dispatch} dispatch 
 * @returns () => store.dispatch({ type: 'ADD' })
 */
function bindActionCreator(actionCreator, dispatch) {
    return function (...args) {
        return dispatch(actionCreator.apply(this, args))
    }
}

/**
 * 
 * @param {add, minus} actionCreators 
 * @param {store.dispatch} dispatch 
 * @returns 
 */
export default function bindActionCreators(actionCreators, dispatch) {
    const boundActionCreators = {}
    for (const key in actionCreators) {
        const actionCreator = actionCreators[key]
        if (typeof actionCreator === 'function') {
            boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
        }
    }

    // { add: ƒ, minus: ƒ }
    return boundActionCreators
}