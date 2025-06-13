import { useState, startTransition } from 'react';


const bigList = Array.from({ length: 10000 }, (_, i) => `Item ${i}`);

export default function StartTransition() {
  const [input, setInput] = useState('');
  const [list, setList] = useState([]);

  function handleChange(e) {
    const value = e.target.value;
    setInput(value); // 紧急更新，保证输入框流畅
    startTransition(() => {
      // 非紧急更新，慢慢渲染大列表
      const filtered = bigList.filter(item => item.includes(value));
      setList(filtered);
    });
  }

  return (
    <>
      <input value={input} onChange={handleChange} />
      <ul>
        {list.map(item => <li key={item}>{item}</li>)}
      </ul>
    </>
  );
}