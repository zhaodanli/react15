import { createRouterMiddleware } from './middleware';
import { push, locationChangeAction } from './actions';
import { createRouterReducer } from './reducer';
/**
 * 创建redux版本的history 上下文
 * @param {*} history 原始的history对象  
 */
export function createReduxHistoryContext({ history }) {
  const routerMiddleware = createRouterMiddleware(history);
  const routerReducer = createRouterReducer(history);
  function createReduxHistory(store) {
    store.dispatch(locationChangeAction(history.location, history.action));
    //订阅路径变化事件，当路径发生变化后重新添发动作给仓库，重新保存路径
    history.listen(({ location, action }) => {
      store.dispatch(locationChangeAction(location, action));
    });
    return {
      createHref: history.createHref,
      push: (...args) => store.dispatch(push(...args)),//history.push('/counter');
      listen: history.listen,
      get location() {//原来获取路径是从history对象上取的，现在是从仓库中取
        return store.getState().router.location;
      },
      get action() {
        return store.getState().router.action;
      }
    };
  }
  return {
    routerMiddleware,
    createReduxHistory,
    routerReducer
  }
}