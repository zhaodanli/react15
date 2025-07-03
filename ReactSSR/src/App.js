import React, { usrEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import routesConfig from './routesConfig';
import Header from './components/Header';
import { Provider } from 'react-redux';
// import { getStore } from './store';
import actionCreators from './store/actionCreators/auth';
// import { useDispatch } from 'react-redux';

function App({ store }) {
  // const store = getStore();

  // Provider外层拿不到 store
  // const dispatch = useDispatch()

  // usrEffect(() => {
  //   dispatch(actionCreators.validate())
  // }, [])

  return (
    <Provider store={store}>
      <Header />
      {useRoutes(routesConfig)}
    </Provider>
  )
}

App.loadData = (store) => {
  return store?.dispatch?.(actionCreators.validate())
}
export default App;