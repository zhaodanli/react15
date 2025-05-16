import React from './react';
import ReactDOM from './react-dom';

// import { updateQueue } from './Component';

// let jsx = <h1 className="title" style={{color:'red'}}>hello</h1>
// console.log(jsx)

// let element1 = (
//   <div className="title" style={{ color: "red" }}>
//     <span>hello</span>world
//   </div>
// );
// console.log(element1);
// ReactDOM.render(element1, document.getElementById("root"));

// // 函数组件
// function FunctionComponent(props){
//     return <div className="title" style={{ color: "red" }}> <span>{props.name}</span>{props.children}</div>
// }
// let element = <FunctionComponent name="hello">world</FunctionComponent>;

// 类组件
// class ClassComponent extends React.Component {
//     render() {
//         return <div className="title" style={{ color: "blue" }}>{this.props.name}{this.props.children}</div>;
//     }
// }
// let element = <ClassComponent name="hello">world</ClassComponent>;

// ReactDOM.render(element, document.getElementById("root"));

// class Counter extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = { number: 0 };
//         console.log('Counter 1.constructor')
//     }

//     componentWillMount() { // 取本地的数据 同步的方式：采用渲染之前获取数据，只渲染一次
//         console.log('Counter 2.componentWillMount');
//     }
//     componentDidMount() {
//         console.log('Counter 4.componentDidMount');
//     }
//     /**
//      * event 是合成事件对象
//      * 作用：
//      * 1. 作为 prefill
//      * 2. 处理兼容性
//      *  */ 
//     handleClick = (event) => {
//         // updateQueue.isBatchingUpdate = true;
//         // this.setState((state) => ({ number: state.number + 1 }));
//         // console.log(this.state.number);
//         this.setState((state) => ({ number: state.number + 1 }));
//         // updateQueue.batchUpdater();
//         // console.log(this.state.number);
//         // 阻止冒泡
//         // setTimeout(() => {
//         //     console.log(this.state.number);
//         //     this.setState((state) => ({ number: state.number + 1 }));
//         //     console.log(this.state.number);
//         //     this.setState((state) => ({ number: state.number + 1 }))    ;
//         //     console.log(this.state.number);
//         // }, 0);
//         // event.stopPropagation();
//     }
//     handleDivClick = () => {
//         // console.log('handleDivClick');
//     }
//     // react可以shouldComponentUpdate方法中优化 PureComponent 可以帮我们做这件事
//     shouldComponentUpdate(nextProps, nextState) { // 代表的是下一次的属性 和 下一次的状态
//         console.log('Counter 5.shouldComponentUpdate');
//         return nextState.number % 2 === 0;
//         // return nextState.number!==this.state.number; //如果此函数种返回了false 就不会调用render方法了
//     } //不要随便用setState 可能会死循环
//     componentWillUpdate() {
//         console.log('Counter 6.componentWillUpdate');
//     }
//     componentDidUpdate(nextProps, nextState) {
//         console.log('Counter 7.componentDidUpdate');
//     }
//     render() {
//         console.log('Counter 3.render');
//         return (
//             <div onClick={this.handleDivClick}>
//                 {/* <p>{this.props.title}</p> */}
//                 <p>{this.state.number}</p>
//                 {this .state.number === 4 ? null : <ChildCounter count={this.state.number} />}
//                 <button onClick={this.handleClick}>+</button>
//             </div>
//         )
//     }
// }

// class ChildCounter extends React.Component {
//     componentWillUnmount() {
//         console.log(' ChildCounter 6.componentWillUnmount')
//     }
//     componentWillMount() {
//         console.log('ChildCounter 1.componentWillMount')
//     }
//     render() {
//         console.log('ChildCounter 2.render')
//         return (<div>
//             {this.props.count}
//         </div>)
//     }
//     componentDidMount() {
//         console.log('ChildCounter 3.componentDidMount')
//     }
//     componentWillReceiveProps(newProps) { // 第一次不会执行，之后属性更新时才会执行
//         console.log('ChildCounter 4.componentWillReceiveProps')
//     }
//     shouldComponentUpdate(nextProps, nextState) {
//         console.log('ChildCounter 5.shouldComponentUpdate')
//         return nextProps.count % 3 === 0; //子组件判断接收的属性 是否满足更新条件 为true则更新
//     }
// }
// ReactDOM.render(<Counter />, document.getElementById("root"));
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   element1
// );

let lastCounter = null;
class Sum extends React.Component {
    constructor(props) {
        super(props);
        this.a = React.createRef();
        this.b = React.createRef();
        this.result = React.createRef();
        this.counter = React.createRef();
        this.state= { number: 0 };
    }
    handleAdd = () => {
        let a = this.a.current.value;
        let b = this.b.current.value;
        this.result.current.value = a + b;
        console.log(this.counter.current);
    }
    onClick = () => {
        lastCounter = this.counter.current;
        this.setState( (state) => ({ number: state.number + 1 }), () => {
            console.log(this.counter.current, lastCounter, this.counter.current === lastCounter);
        });
    }
    render() {
        return (
            <>
                <button onClick={this.onClick}>点击触发 {this.state.number }</button>
                <Counter ref={this.counter} />
                <input ref={this.a} />+<input ref={this.b} /><button onClick={this.handleAdd}>=</button><input ref={this.result} />
            </>
        );
    }
}
// ReactDOM.render(
//     <Sum />,
//     document.getElementById('root')
// );

// class TextInput extends React.Component {
//     constructor(props) {
//         super(props);
//         this.input = React.createRef();
//     }
//     getFocus = () => {
//         // this.input.current.focus();
//     }
//     getInputValue = () => {
//         console.log(this.input.current.value);
//         return this.input.current.value;
//     }
//     render() {
//         return <input ref={this.input} />
//     }
// }

// function TextInput2(props, ref) {
//     return <input ref={ref} />
// }
// const ForwardTextInput = React.forwardRef(TextInput2);

// class Form extends React.Component {
//     constructor(props) {
//         super(props);
//         this.input = React.createRef();
//         this.input2 = React.createRef();
//     }
//     getFocus = () => {
//         console.log(this.input.current.getInputValue(), this.input2.current.value);
//     }
//     render() {
//         return (
//             <>
//                 <TextInput ref={this.input} /> + 
//                 <ForwardTextInput ref={this.input2} />
//                 <button onClick={this.getFocus}>获得input框的值</button>
//             </>
//         );
//     }
// }
// // ReactDOM.render(
// //     <Form />,
// //     document.getElementById('root')
// // );

//  =========== dom diff =========
// class CounterList extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             list: ['A', 'B', 'C', 'D', 'E', 'F']
//         }
//     }
//     handleClick = () => {
//         this.setState({
//             list: ['A', 'C', 'E', 'B', 'G']
//         });
//     };
//     render() {
//         return (
//             <React.Fragment>
//                 <ul>
//                     {
//                         this.state.list.map(item => <li key={item}>{item}</li>)
//                     }

//                 </ul>
//                 <button onClick={this.handleClick}>+</button>
//             </React.Fragment>
//         )
//     }
// }
// ReactDOM.render(<CounterList />, document.getElementById('root'));

/** ======================== 新生命周期 getDerivedStateFromProps ============================== */
// class Counter extends React.Component{
//     static defaultProps = {
//         name: '珠峰架构'
//     };
//     constructor(props) {
//         super(props);
//         this.state = { number: 0 }
//     }

//     handleClick = () => {
//         this.setState({ number: this.state.number + 1 });
//     };

//     render() {
//         console.log('3.render');
//         return (
//             <div>
//                 <p>{this.state.number}</p>
//                 <ChildCounter number={this.state.number} />
//                 <button onClick={this.handleClick}>+</button>
//             </div>
//         )
//     }
// }
// class ChildCounter extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = { number: 0 };
//     }

//     /** 
//      * 从属性中获取派生状态
//      * 新属性、新状态、强制更新都会走它
//      *  */
//     static getDerivedStateFromProps(nextProps, prevState) {
//         return { number: nextProps.number * 2 };
//         const { number } = nextProps;
//         // 当传入的type发生变化的时候，更新state
//         if (number % 2 === 0) {
//             return { number: number * 2 };
//         } else {
//             return { number: number * 3 };
//         }
//     }
//     render() {
//         console.log('child-render', this.state)
//         return (<div>
//             {this.state.number}
//         </div>)
//     }

// }

// ReactDOM.render(
//     <Counter />,
//     document.getElementById('root')
// );

/** ===================== 新生命周期 ============================ */
class ScrollingList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { messages: [] }
        this.wrapper = React.createRef();
    }

    addMessage() {
        this.setState(state => ({
            messages: [`${state.messages.length}`, ...state.messages],
        }))
    }
    componentDidMount() {
        this.timeID = window.setInterval(() => {//设置定时器
            this.addMessage();
        }, 1000)
    }
    componentWillUnmount() {//清除定时器
        window.clearInterval(this.timeID);
    }

    // 更新前 state 快照
    getSnapshotBeforeUpdate() {// 很关键的，我们获取当前rootNode的scrollHeight，传到componentDidUpdate 的参数perScrollHeight
        return {prevScrollTop:this.wrapper.current.scrollTop,prevScrollHeight:this.wrapper.current.scrollHeight};
    }
    componentDidUpdate(pervProps, pervState, {prevScrollHeight,prevScrollTop}) {
        //当前向上卷去的高度加上增加的内容高度
        this.wrapper.current.scrollTop = prevScrollTop + (this.wrapper.current.scrollHeight - prevScrollHeight);
    }
    render() {
        let style = {
            height: '100px',
            width: '200px',
            border: '1px solid red',
            overflow: 'auto'
        }
        //<div key={index}>里不要加空格!
        return (
            <div style={style} ref={this.wrapper} >
                {this.state.messages.map((message, index) => (
                    <div key={index}>{message}</div>
                ))}
            </div>
        );
    }
}

// ReactDOM.render(
//     <ScrollingList />,
//     document.getElementById('root')
// );

// ThemeContext 仅仅是用于共享的变量
let ThemeContext = React.createContext();
let languageContext = React.createContext();
console.log(ThemeContext);
const { Provider, Consumer } = ThemeContext;

let style = { margin: '5px', padding: '5px' };

/** ThemeContext 函数组件使用方法 */
function Title(props) {
  console.log('Title');
  return (
    <Consumer>
        {
            (contextValue) => (
                <languageContext.Consumer>
                    {
                        (languageContext) => (
                            <div style={{ ...style, border: `5px solid ${contextValue.color}` }}>
                                Title
                                { languageContext.language }
                            </div>
                        )
                    }
                
                </languageContext.Consumer>
            )
        }
    </Consumer>
  )
}

/** ThemeContext 类组件使用方法 */
class Header extends React.Component {
  static contextType = ThemeContext
  render() {
    console.log('Header');
    console.log(this.context)
    return (
        <languageContext.Consumer>
            {
                (languageContext) => (
                    <div style={{ ...style, border: `5px solid ${this.context.color}` }}>
                        Header
                        {languageContext.language}
                        <Title />
                    </div>
                )
            }
        </languageContext.Consumer>
    )
  }
}
function Content() {
  console.log('Content');
  return (
    <Consumer>
      {
        (contextValue) => (
          <div style={{ ...style, border: `5px solid ${contextValue.color}` }}>
            Content
            <button style={{ color: 'red' }} onClick={() => contextValue.changeColor('red')}>变红</button>
            <button style={{ color: 'green' }} onClick={() => contextValue.changeColor('green')}>变绿</button>
          </div>
        )
      }
    </Consumer>
  )
}

class Main extends React.Component {
  static contextType = ThemeContext
  render() {
    console.log('Main');
    return (
      <div style={{ ...style, border: `5px solid ${this.context.color}` }}>
        Main
        <Content />
      </div>
    )
  }
}

class Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = { color: 'black', language: '中文' };
  }
  changeColor = (color) => {
    this.setState({ color });
  }

  render() {
    console.log('Page');
    let contextValue = { color: this.state.color, changeColor: this.changeColor };
    return (
        <languageContext.Provider value={{ language: this.state.language }}>
            <Provider value={contextValue}>
        
                <div style={{ ...style, width: '250px', border: `5px solid ${this.state.color}` }}>
                    Page
                    <Header />
                    <Main />
                </div>
            </Provider >

            {/* <div style={{ ...style, width: '250px', border: `5px solid ${this.state.color}` }}>
                Page
                <Header />
                <Main />
            </div> */}
        </languageContext.Provider>
    )
  }
}
ReactDOM.render(
  <Page />,
  document.getElementById('root')
);