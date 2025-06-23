/** 这几个文件共同实现了 Redux 与 history 路由的集成，配合流程如下
 * actions.js：定义路由相关的 action（如 push、LOCATION_CHANGE）。
 * middleware.js：拦截特定 action（如 push），自动调用 history 的方法（如 history.push）。
 * reducer.js：监听 LOCATION_CHANGE，把最新的路由信息同步到 redux 仓库。
 * create.js：整合上述内容，生成中间件、reducer，并提供 createReduxHistory（用于 HistoryRouter）。
 */

export { push } from './actions';
export { createReduxHistoryContext } from './create';