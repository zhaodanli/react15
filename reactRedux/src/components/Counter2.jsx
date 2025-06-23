import { useDispatch, useSelector, useBoundDispatch } from '../react-redux';
import actions from '../store/actions/counter2';

export default function Counter2() {
    let state = useSelector(state => state.counter2);
    let dispatch = useDispatch();
    let boundActions = useBoundDispatch(actions);

    return (
        <div>
            <p>Counter2: {state.number}</p>
            {/* <button onClick={()=>dispatch({type:'ADD2'})}>+</button>
            <button onClick={()=>dispatch({type:'MINUS2'})}>-</button> */}
            <button onClick={boundActions.add2}>+</button>
            <button onClick={boundActions.minus2}>-</button>
        </div>
    )
}