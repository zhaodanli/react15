import type { Dispatch } from 'redux';
import { useNavigate } from '../dva/router';

export interface Counter1State {
    number: 0
}

type Counter1Props = Counter1State & { dispatch: Dispatch };

const Counter1 = (props: Counter1Props) => {
    const navigate = useNavigate();
    return (
        <div>
            <p>{props.number}</p>
            <button onClick={() => props.dispatch({ type: 'counter1/add' })}>add</button>
            <button onClick={() => props.dispatch({ type: 'counter1/asyncAdd' })}>asyncAdd</button>
            <button onClick={() => props.dispatch({ type: 'counter1/minus' })}>-</button>
            <button onClick={() => navigate('/counter2')}>跳转到counter2</button>
        </div>
    )
}

export default Counter1