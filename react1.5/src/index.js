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
// 类组件
class ClassCounter extends React.PureComponent {
  render() {
      console.log('ClassCounter render');
      return <div>ClassCounter:{this.props.count}</div>
  }
}
// 函数组件
function FunctionCounter(props) {
  console.log('FunctionCounter render'); debugger
  return <div>FunctionCounter:{props.count}</div>
}
const MemoFunctionCounter = React.memo(FunctionCounter);
class App extends React.Component {
  state = { number: 0 }
  amountRef = React.createRef()
  handleClick = () => {
      let nextNumber = this.state.number + parseInt(this.amountRef.current.value);
      this.setState({ number: nextNumber });
  }
  render() {
      return (
          <div>
              <ClassCounter count={this.state.number} />
              <MemoFunctionCounter count={this.state.number} />
              <input ref={this.amountRef} />
              <button onClick={this.handleClick}>+</button>
          </div>
      )
  }
}
ReactDOM.render(
  <App />, document.getElementById('root'));
