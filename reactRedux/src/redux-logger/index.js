export default  (api) => (next) => (action) => {
  console.log(api.getState());
  next(action);
  console.log(api.getState());
  return action;
};