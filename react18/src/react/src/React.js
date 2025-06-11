import { useReducer, useState, useEffect, useLayoutEffect } from "./ReactHooks.js";
import ReactSharedInternals from "./ReactSharedInternals.js";

/**
 * useReducer: {
 *   mountReducer: function,
 *   dispatchReducerAction: function
 * }
 * 
 * 秘密的内部变量，内部之间共享的变量
 * __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
 *   ReactCurrentDispatcher: {}
 * }
 */
export { useReducer, useState, useEffect, useLayoutEffect, ReactSharedInternals as __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED };

