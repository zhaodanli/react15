import { useLayoutEffect, useState, useRef } from 'react';

/**
 * 
 * @returns [ style1, dragRef1 ]
 */
function useDrag() {
    // dom 元素的位置
    const positionRef = useRef({
        currentX: 0, currentY: 0,
        lastX: 0, lastY: 0
    })

    // 要让哪个元素移动
    const domRef = useRef(null);

    const [, forceUpdate] = useState({});

    useLayoutEffect(() => {
        let startX, startY;
        const start = function (event) {
            // targetTouches[0]：如果你用多根手指同时触摸同一个元素，targetTouches 里会有多个点，[0] 取的是第一个。
            const { clientX, clientY } =  event.targetTouches[0];
            startX = clientX;
            startY = clientY;
            domRef.current.addEventListener('touchmove', move);
            domRef.current.addEventListener('touchend', end);
        }

        const move = function (event) {
            const { clientX, clientY } = event.targetTouches[0];
            positionRef.current.currentX = positionRef.current.lastX + (clientX - startX);
            positionRef.current.currentY = positionRef.current.lastY + (clientY - startY);
            forceUpdate({});
        }

        const end = (event) => {
            positionRef.current.lastX = positionRef.current.currentX;
            positionRef.current.lastY = positionRef.current.currentY;
            domRef.current.removeEventListener('touchmove', move);
            domRef.current.removeEventListener('touchend', end);
        }

        domRef.current.addEventListener('touchstart', start);

    }, []);

    let style = { x: positionRef.current.currentX, y: positionRef.current.currentY };
    return [style, domRef]
}

export default useDrag;