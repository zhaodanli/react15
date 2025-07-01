import Counter from './components/Counter';
import { QueryClient, QueryClientProvider } from 'react-query';
const queryClient = new QueryClient();
import { ReactQueryDevtools } from 'react-query/devtools'
import { useState } from 'react';

function App() {

  const [show, setShow] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <button onClick={() => setShow(!show)}>{show ? '隐藏' : '显示'}</button>
      {show && <Counter queryKey="users1" />}

      {/* 查询键去重 */}
      <Counter queryKey="users" />
      <Counter queryKey="users" />
      <ReactQueryDevtools initialIsOpen={true} />
    </QueryClientProvider>
  )
}

export default App
