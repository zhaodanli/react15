const listeners = {};

// 触发
const trigger = (key, data) => {
  if (listeners[key]) {
    listeners[key].forEach(item => item(data));
  }
};


// 订阅
const subscribe = (key, listener) => {
  if (!listeners[key]) {
    listeners[key] = [];
  }

  listeners[key].push(listener);
  return function unsubscribe() {
    const index = listeners[key].indexOf(listener);
    listeners[key].splice(index, 1);
  };
};

export { trigger, subscribe };