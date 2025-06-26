import { Machine, interpret, assign, useService } from '../xstate';


// 创建状态机
const machine = Machine({
    id: 'toggle', // 开关
    initial: 'inactive', // 初始状态
    context: {
        todoList: ['吃饭'],
        text: ''
    },
    states: {
        inactive: {
            on: { // 关闭状态点击状态机
                "TOGGLE": 'active',
                "CHANGE": { // inactive 状态下 CHANGE 发生 actions 要给 text 赋值
                    actions: [
                        assign({
                            text: (_, event) => event.value
                        })
                    ]
                },
                "ADD_TODO": {
                    actions: [
                        assign({
                            text: "",
                            todoList: context => [...context.todoList, context.text]
                        })
                    ]
                }
            },
        },
        active: {
            on: {
                "TOGGLE": 'inactive',
                "INCREMENT": {
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
    // const service = interpret(machine, options);
})

// 创建服务
let service = interpret(machine).onTransition(state => {
    console.log(state.value)
    console.log(state.context)
});
// 启动服务
service.start();

export default function XStateDemo() {
    const [state, send] = useService(service)
    const { context: { text, todoList } } = state

    return (
        <div>
            <button onClick={() => send({ type: 'ADD_TODO' })}>添加</button>
            <input value={text} onChange={e => send({ type: 'CHANGE', value: e.target.value })} />
            <ul>
                {
                    todoList.map(item => <li key={item}>{item}</li>)
                }
            </ul>
        </div>
    )
}

