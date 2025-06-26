import { useState } from 'react';

export function useService(service) {
    let [, forceUpdate] = useState(0);
    return [service.state, (event) => {
        service.send(event);
        forceUpdate(x => x + 1);
    }];
}

export default useService;