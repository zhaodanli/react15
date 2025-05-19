import React from './react';
import ReactDOM from './react-dom';

// import React from 'react';
// import ReactDOM from 'react-dom/client';

// 基础组件
import ReactBase from './IndeBaseComponent';

// 高阶组件
// import ReactHightComponent from './ReactHightComponent'
// 反向继承
import ReverseInstansComponent from './ReverseInstansComponent'

// ReactDOM.render(
//   <ReactBase />,
//   document.getElementById('root')
// );

/** ============ 高阶组件 ============*/ 
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<ReactHightComponent />);
// root.render(<ReverseInstansComponent title="标题" />);

/** ============ 反向继承 ============ */ 
// ReactDOM.render(
//   <ReverseInstansComponent />,
//   document.getElementById('root')
// );

/** =========== pureComponent ============== */

// import PureAndMemoComponent from './PureAndMemoComponent'
// ReactDOM.render(
//   <PureAndMemoComponent />, document.getElementById('root'));

/** 
 * potal 
 * React v16增加了对Portal的直接支持
 * 它可以把JSX渲染到一个单独的DOM节点中 
  */
// import PortalComponent from './PortalComponent';

// ReactDOM.render(
//   <PortalComponent />, document.getElementById('root'));

/** react Hooks 实现 */

let  Child = ({data,handleClick})=>{
  console.log('Child render');
  return (
     <button onClick={handleClick}>{data.number}</button>
  )
}
Child = React.memo(Child);

/** ================ useReducer =============== */

const CounterContext = React.createContext();
function reducer(state={number:0}, action) {
  switch (action.type) {
    case 'ADD':
      return {number: state.number + 1};
    case 'MINUS':
      return {number: state.number - 1};
    default:
      return state;
  }
}

function Counter(){
    let { CounterContextState, CounterContextDispatch} = React.useContext(CounterContext);
    const [state, dispatch] = React.useReducer(reducer,{ number:0 });

    React.useEffect(() => {
      console.log('开启一个新的定时器')
      const $timer = setInterval(() => {
        dispatch(number => number + 1);
      }, 5000);
      return () => {
          console.log('销毁老的定时器');
          clearInterval($timer);
      }
  });

    return (
        <div>
          Count: {state.number}
          <button onClick={() => dispatch({type: 'ADD'})}>+</button>
          <button onClick={() => dispatch({type: 'MINUS'})}>-</button>
          <p>{CounterContextState.number}</p>
          <button onClick={() => CounterContextDispatch({type: 'ADD'})}>+</button>
          <button onClick={() => CounterContextDispatch({type: 'MINUS'})}>-</button>
        </div>
    )
}

function App(){
  console.log('App render');

  const [ name, setName ] = React.useState('1');
  const [ number, setNumber ]= React.useState(0);
  const [CounterContextState, CounterContextDispatch] = React.useReducer(reducer,{ number:0 });


  // let data = { number };
  let data = React.useMemo(()=>({number}),[number]);

  // let handleClick = ()=> setNumber(number+1);
  let handleClick = React.useCallback(()=> setNumber(number+1),[number]);

  return (
    <CounterContext.Provider value={{CounterContextState, CounterContextDispatch }}>
      <div>
        <input type="text" value={name} onChange={event=>setName(event.target.value)}/>
        {/* 测试memo */}
        {/* <Child data={data} /> */}
        {/* 测试callback */}
        <Child data={data} handleClick={handleClick}/>
        <Counter />
        {/* <p>{number}</p>
        <button onClick={handleClick}>+</button> */}
      </div>
    </CounterContext.Provider>
  )
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
