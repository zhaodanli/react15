import React, { Component } from 'react'


/**
 * react 18之前 0023 异步里面是同步的， 有个变量叫 isBtchingupdate， 之间合成执行前 设置为true, 批量。执行后改为false, 异步的时候这个状态是false，所以就成批量了
 * react 18之后： 并发模式下：根据优先级批量， 都是批量
 */
export default class extends Component {
    state = { number: 0 }
    handleCLick = () => {
         this.setState({ number: this.state.number + 1 });
        console.log(this.state);
        this.setState({ number: this.state.number + 1 });
        console.log(this.state);
        setTimeout(() => {
            setTimeout(() => {
                this.setState({ number: this.state.number + 1 });
                console.log(this.state);
                this.setState({ number: this.state.number + 1 });
                console.log(this.state);
            })
        }, 0);
    };

    render() {
        return (
            <div>
                <p>{this.state.number}</p>
                <button onClick={this.handleCLick}>+</button>
            </div>
        );
    }
}