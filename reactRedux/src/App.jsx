import Counter1 from './components/Counter1';
import Counter2 from './components/Counter2';
import { Provider } from './react-redux';
import store from './store';

export default function App() {
    return (
        <div>
            <Provider store={store}>
                <Counter1 />
                <Counter2 />
            </Provider>
        </div>
    )
}