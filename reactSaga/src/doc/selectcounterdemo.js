/**
 * 
 * @param {[selectCounter1 = state => state.counter1, selectCounter2 = state => state.counter2]} selectors 
 * @param {fn} reducer 
 * @returns 
 */
function createSelector(selectors, reducer) {
    let lastState;
    let lastValue;
    // 返回函数接收 state
    return function (state) {
        if (lastState === state) {
            return lastValue;
        }
        let values = selectors.map(selector => selector(state));
        // [ { number: 1 }, { number: 2 } ]
        lastValue = reducer(...values);
        lastState = state;
        return lastValue;
    }
}

const selectCounter1 = state => state.counter1
const selectCounter2 = state => state.counter2

const totalSelector = createSelector(
    [selectCounter1, selectCounter2],
    (counter1, counter2) => {
        // console.log(counter1, counter2)
        // [ { number: 1 }, { number: 2 } ]
        return counter1.number + counter2.number;
    }
)

let state = { counter1: { number: 1 }, counter2: { number: 2 } };
let state1 = totalSelector(state);
let state2 = totalSelector(state);
console.log(state1, state2);