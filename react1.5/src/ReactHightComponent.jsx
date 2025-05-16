import React from 'react';
import ReactDOM from 'react-dom';

const loading = message =>OldComponent =>{
    return class extends React.Component{
        render(){
            const state = {
                show:()=>{
                   console.log('show', message);
                },
                hide:()=>{
                     console.log('hide', message);
                }
            }
            return  (
                <OldComponent {...this.props} {...state}/>
            )
        }
    }
}
@loading('消息')
class Hello extends React.Component{
    render(){
        return (
            <div
                >hello
                <button onClick={this.props.show}>show</button>
                <button onClick={this.props.hide}>hide</button>
            </div>
        );
    }
}

export default Hello
/**
 * 组合优于继承
 * 和 @loading('消息') 同等效果
 */
// let LoadingHello  = loading('消息')(Hello);
// export default LoadingHello