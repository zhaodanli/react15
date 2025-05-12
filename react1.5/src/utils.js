import { REACT_ELEMENT, REACT_TEXT } from './constants'

export function toVdom(element) {
    if(typeof element === 'string' || typeof element === 'number') {
        return {
            $$typeof: REACT_ELEMENT,
            type: REACT_TEXT,
            props: element
        }
    } else {
        return element;
    }
}