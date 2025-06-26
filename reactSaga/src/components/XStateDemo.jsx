import { Machine, interpret } from '../xstate';
import { useState } from 'react'



export default function XStateDemo() {
    const [value, setValue] = useState(0);


    // 创建状态机
    const machine = Machine({
        id: 'toggle', // 开关
        initial: 'inactive', // 初始状态
        context: { value },
        states: {
            inactive: {
                on: { // 关闭状态点击状态机
                    TOGGLE: 'active',
                },
            },
            active: {
                on: {
                    TOGGLE: 'inactive',
                    INCREMENT: {
                        target: 'active', // stay in the same state
                        actions: 'incrementCount', // action to handle increment
                    },
                },
            },
        },
    // }, {
    //     actions: {
    //         incrementCount: (context) => {
    //             context.context.value += 1;
    //             setValue(context.context.value)
    //             console.log(`Count incremented: ${context.context.value}`);
    //         },
    //     }
    // });

    // // 创建服务时添加可选参数
    // const options = {
    //     context: { value },
    //     devTools: true, // 启用开发者工具
    //     // 也可以添加 listeners
    //     listeners: {
    //         onEvent: (event) => {
    //             console.log('Event received:', event);
    //         },
    //     },
    // };

    // // 创建服务
    // const service = createActor(machine, options);
    })

    // 创建服务
    let service = interpret(machine).onTransition(state =>
        console.log(state.value)
    );
    // 启动服务
    service.start();

    const toggle = () => {
        service.send({ type: 'TOGGLE' })
        service.send({ type: 'TOGGLE' })
    }
    return (
        <div onClick={toggle}>
            value: {value}
        </div>
    )
}

