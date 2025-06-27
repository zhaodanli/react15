import type { Dispatch } from 'redux';

export interface Counter2State {
    number: 0
}

type Counter2Props = Counter2State & { dispatch: Dispatch };
const Counter2 = (props: Counter2Props) => {
    return (
        <div>
            <p>{props.number}</p>
            <button onClick={() => props.dispatch({ type: 'counter2/add' })}>+</button>
            <button onClick={() => props.dispatch({ type: 'counter2/minus' })}>-</button>
        </div>
    )
}

export default Counter2