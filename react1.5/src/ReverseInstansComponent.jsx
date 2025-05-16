import React from './react';
import ReactDOM from './react-dom';

// import React from 'react';
// import ReactDOM from 'react-dom';

class Button extends React.Component{
    state = {name:'张三'}
    componentWillMount(){
        console.log('Button componentWillMount');
    }
    componentDidMount(){
        console.log('Button componentDidMount');
    }
    render(){
        console.log('Button render');
        return <button name={this.state.name} title={this.props.title}/>
    }
}
const wrapper = OldComponent =>{
    return class NewComponent extends OldComponent{
        state = {number:0}
        componentWillMount(){
            console.log('WrapperButton componentWillMount');
             super.componentWillMount();
        }
        componentDidMount(){
            console.log('WrapperButton componentDidMount');
             super.componentDidMount();
        }
        handleClick = ()=>{
            this.setState({number:this.state.number+1});
        }
        render(){
            console.log('WrapperButton render');
            // 返回父类的props
            let renderElement = super.render();
            // 解构老属性，生成新属性
            let newProps = {
                ...renderElement.props,
                ...this.state,
                onClick:this.handleClick
            }
            return  React.cloneElement(
                renderElement,
                newProps,
                this.state.number
            );
        }
    }
}
let WrappedButton = wrapper(Button);



/** ============ render props ============ */ 
class MouseTracker extends React.Component {
    constructor(props) {
        super(props);
        this.state = { x: 0, y: 0 };
    }
  
    handleMouseMove = (event) => {
        this.setState({
            x: event.clientX,
            y: event.clientY,
        });
    }
  
    render() {
        return (
            <div onMouseMove={this.handleMouseMove}>
                <h1>移动鼠标!</h1>
                <p>当前的鼠标位置是 ({this.state.x}, {this.state.y})</p>
            </div>
        );
    }
}
  
// ReactDOM.render(
//   <MouseTracker />,
//   document.getElementById('root')
// );

/**  ======== children 传递 =========== */
// ReactDOM.render(<MouseTracker >
//   {
//       (props) => (
//           <div>
//               <h1>移动鼠标!</h1>
//               <p>当前的鼠标位置是 ({props.x}, {props.y})</p>
//           </div>
//       )
//   }
// </MouseTracker >, document.getElementById('root'));

/** =============== render 属性传递 ============ */
// ReactDOM.render(<MouseTracker render=
//   {
//       (props) => (
//           <div>
//               <h1>移动鼠标!</h1>
//               <p>当前的鼠标位置是 ({props.x}, {props.y})</p>
//           </div>
//       )
//   }>
// </MouseTracker >, document.getElementById('root'));

/** =============== HOC ============ */
function withTracker(OldComponent){
    return class MouseTracker extends React.Component{
        constructor(props){
            super(props);
            this.state = {x:0,y:0};
        }
        handleMouseMove = (event)=>{
            this.setState({
                x: event.clientX,
                y: event.clientY,
            });
        }
        render(){
            return (
                <div onMouseMove = {this.handleMouseMove}>
                    <OldComponent {...this.state}/>
                </div>
            )
        }
    }
}

function Show(props){
    return (
        <React.Fragment>
            <h1>请移动鼠标</h1>
            <p>当前鼠标的位置是: x:{props.x} y:{props.y}</p>
        </React.Fragment>
    )
}

let HighShow = withTracker(Show);

export default HighShow