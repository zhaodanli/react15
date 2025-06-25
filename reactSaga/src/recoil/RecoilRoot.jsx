import React, { useRef } from 'react';
import AppContext from './AppContext';

function RecoilRoot({ children }) {
    const state = {};

    const store = {
        getState: () => state
    };

    const storeRef = useRef(store);

    return (
        <AppContext.Provider value={storeRef}>
            {children}
        </AppContext.Provider>
    )
}

export default RecoilRoot;