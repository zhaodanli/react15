import { useDispatch, useSelector } from '../react-redux';

export default function Counter2() {
    let state = useSelector(state => state.counter2);
    let dispatch = useDispatch();

    return (
        <div>
            <p>Counter2: {state.number}</p>
            <button onClick={()=>dispatch({type:'ADD2'})}>+</button>
            <button onClick={()=>dispatch({type:'MINUS2'})}>-</button>
        </div>
    )
}