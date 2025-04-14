import React from './react';

const sayhello = () => {
    alert('hello world');
}

// 浏览器不能识别jsx 需要babel编译
// const element = (
//     <button id='sayhello' style={{color: 'red', backgroundColor: 'blue'}} onClick={sayhello}>
//         hello world
//         <span>hello</span>
//         <span>world</span>
//     </button>
// )

// 将 element 转成语法树、虚拟dom、 dom diff

const element = React.createElement('button', 
    {
        id: 'sayhello', 
        style: {
            color: 'red', 
            backgroundColor: 'blue'
        },
        onClick: sayhello
    },
    'hello',
    React.createElement('span', {}, 'hello'),
    React.createElement('span', {}, 'world')
)
// 下面就是 语法树、虚拟dom、 dom diff
// element = { type: 'button', props: { id: 'sayhello', style: { color: 'red', backgroundColor: 'blue' }, onClick: [Function: sayhello] }, children: [ 'hello', { type: 'span', props: null, children: [Array] }, { type: 'span', props: null, children: [Array] } ] }
React.render(element, document.getElementById('root'))
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//   </React.StrictMode>
// );
