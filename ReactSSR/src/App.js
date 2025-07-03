import React, { usrEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import routesConfig from './routesConfig';
import Header from './components/Header';
import { Provider } from 'react-redux';
// import { getStore } from './store';
import actionCreators from './store/actionCreators/auth';
// import { useDispatch } from 'react-redux';

import useStyles from 'isomorphic-style-loader-react18/useStyles'
import styles from './App.css'

function App({ store }) {
  // const store = getStore();

  // Provider外层拿不到 store
  // const dispatch = useDispatch()

  // usrEffect(() => {
  //   dispatch(actionCreators.validate())
  // }, [])

  // 自定义 hooks 搜集样式到 css 里去 服务端逻辑
  useStyles(styles);

  return (
    <Provider store={store}>
      <Header />
      {useRoutes(routesConfig)}
      <div className={styles.color}>red</div>
    </Provider>
  )
}

App.loadData = (store) => {
  return store?.dispatch?.(actionCreators.validate())
}
export default App;