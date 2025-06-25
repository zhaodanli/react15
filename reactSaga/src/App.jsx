import React from 'react'; // 确保这个只被引入一次
import { Provider } from 'react-redux';
import RecoilRootDemo from './components/RecoilRootDemo';
import { RecoilRoot } from './recoil';

export default function App() {
    return (
        <RecoilRoot>
            <RecoilRootDemo />
        </RecoilRoot>
    )
}

// import React from 'react';
// import { RecoilRoot, atom, selector, useRecoilState, useRecoilValue } from 'recoil';

// // 定义 atom
// const textState = atom({
//     key: 'textState',
//     default: '',
// });

// // 定义 selector
// const characterCountState = selector({
//     key: 'characterCountState',
//     get: ({ get }) => {
//         const text = get(textState);
//         return text.length;
//     },
// });

// // 组件示例
// function CharacterCounter() {
//     const count = useRecoilValue(characterCountState);
//     return <div>Character Count: {count}</div>;
// }

// function TextInput() {
//     const [text, setText] = useRecoilState(textState);
//     const handleChange = (event) => {
//         setText(event.target.value);
//     };
//     return <input type="text" value={text} onChange={handleChange} />;
// }

// // App 组件
// function App() {
//     return (
//         <RecoilRoot>
//             <TextInput />
//             <CharacterCounter />
//         </RecoilRoot>
//     );
// }

// export default App;

// import { selector } from 'recoil';
// import axios from 'axios';

// const fetchDataSelector = selector({
//     key: 'fetchDataSelector',
//     get: async () => {
//         const response = await axios.get('https://api.example.com/data');
//         return response.data;
//     },
// });


// import { useRecoilValue } from 'recoil';

// function DataDisplay() {
//     const data = useRecoilValue(fetchDataSelector);
//     return <div>{JSON.stringify(data)}</div>;
// }