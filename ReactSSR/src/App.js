import React from 'react';
import { useRoutes } from 'react-router-dom';
import routesConfig from './routesConfig';
import Header from './components/Header';
import { Provider } from 'react-redux';
// import { getStore } from './store';

function App({ store }) {
  // const store = getStore();

  return (
    <Provider store={store}>
      <Header />
      {useRoutes(routesConfig)}
    </Provider>
  )
}
export default App;