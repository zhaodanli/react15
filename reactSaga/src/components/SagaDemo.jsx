import Counter from './components/Counter';
import { Provider } from 'react-redux';
import store from './store';

export default function SagaDemo() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  )
}