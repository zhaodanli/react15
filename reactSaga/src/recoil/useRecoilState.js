import { useState } from 'react';
import { getNode } from './atom';

function useRecoilState(recoilState) {
    return [recoilState.get(), useSetRecoilState(recoilState)];
}

function useSetRecoilState(recoilState) {
    let [, forceUpdate] = useState(0);
    return newValue => {
        getNode(recoilState.key).set(newValue);
        forceUpdate(x => x + 1);
    }
}
export default useRecoilState;