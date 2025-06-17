import React, { Suspense } from 'react';
import Header from './Header';
import User from './User';
import Footer from './Footer';

export default function App() {
  return (
    <>
      <Header />
      {/* user 向上抛出 promise  Suspense 捕获期间 展示 loading User... 渲染完成重新刷新 */}
      <Suspense fallback={<div>loading User...</div>}>
        <User />
      </Suspense>
      <Footer />
    </>
  );
}
