import useRequestImplement from './useRequestImplement';

function useRequest(service, options = {}) {
  return useRequestImplement(service, options);
}

export default useRequest;