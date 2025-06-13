import { useState, useDeferredValue } from 'react';

const bigList = Array.from({ length: 10000 }, (_, i) => `Item ${i}`);
export default function UseDeferredValue() {
  const [input, setInput] = useState('');
  const deferredInput = useDeferredValue(input); // 延迟 input 的变化

  const filtered = bigList.filter(item => item.includes(deferredInput));

  return (
    <>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <ul>
        {filtered.map(item => <li key={item}>{item}</li>)}
      </ul>
    </>
  );
}