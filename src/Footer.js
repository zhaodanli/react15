import React, { useId }  from 'react';
function Footer() {
  // Footer 组件使用了 Math.random() 生成 id SSR 和 CSR 渲染时生成的 id 不同，导致 <label htmlFor=...> 和 <input id=...> 不一致。
  // 用 React 18 的 useId() 替代 Math.random()，它能保证 SSR/CSR 一致。
  // const id = Math.random();
  const id = useId()
  return (
    <div>
      <label htmlFor={id}>are you ok?</label>
      <input type="checkbox" id={id} />
    </div>
  );
}
export default Footer;