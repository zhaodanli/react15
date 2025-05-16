import React from './react';
import ReactDOM from './react-dom';

// import React from 'react';
// import ReactDOM from 'react-dom/client';

// 基础组件
import ReactBase from './IndeBaseComponent';

// 高阶组件
// import ReactHightComponent from './ReactHightComponent'
// 反向继承
// import ReverseInstansComponent from './ReverseInstansComponent'

// ReactDOM.render(
//   <ReactBase />,
//   document.getElementById('root')
// );

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<ReactHightComponent />);
// root.render(<ReverseInstansComponent title="标题" />);

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
            console.log('wrapper componentWillMount');
             super.componentWillMount();
        }
        componentDidMount(){
            console.log('wrapper componentDidMount');
             super.componentDidMount();
        }
        handleClick = ()=>{
            this.setState({number:this.state.number+1});
        }
        render(){
            console.log('wrapper render');
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

ReactDOM.render(
  <WrappedButton />,
  document.getElementById('root')
);
