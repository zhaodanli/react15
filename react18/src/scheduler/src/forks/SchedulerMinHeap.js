// 向数组里放元素
export function push(heap, node) {
    const index = heap.length; // 获取元素数量 1 2 3
    heap.push(node); // 放到数组尾部 [1] [1, 2] [1, 2, 3]
    siftUp(heap, node, index); // 向上调整 [1] [1, 2] [1, 2, 3]
}

// 查看堆顶节点
export function peek(heap) {
    return heap.length === 0 ? null : heap[0];
}

// 弹出堆顶
export function pop(heap) {
    if (heap.length === 0) {
        return null;
    }
    const first = heap[0];
    const last = heap.pop(); // 弹出最后一个元素
    // 堆顶和堆尾交换位置，然后向下调整
    if (last !== first) {
        heap[0] = last;
        siftDown(heap, last, 0);
    }
    return first;
}

/** 向上调整
 * @param {*} i 索引
 */
function siftUp(heap, node, i) {
    let index = i; // 缓存索引
    while (index > 0) {
        // const parentIndex = index - 1 >>> 1; // >>> 优先级比较低，不需要加括号
        const parentIndex = (index - 1) >>> 1; // 拿到父节点索引 等于 （i-1）/2 向下取证 1.5 = 1
        const parent = heap[parentIndex]; // 缓存 parent
        // >0 说明前面的数值大，则优先级低，需要交换
        if (parent !== null && compare(parent, node) > 0) {
            heap[parentIndex] = node;
            heap[index] = parent;
            // 让index为父亲索引，继续向上查找
            index = parentIndex;
        } else {
            return;
        }
    }
}

/** 向下调整 父节点和左右子节点较小的交换
 * @param {*} i 
 */
function siftDown(heap, node, i) {
    let index = i;
    const length = heap.length;
    while(index < length) {
        const leftIndex = (index + 1) * 2 - 1; // 获取左子节点
        const left = heap[leftIndex];
        const rightIndex = leftIndex + 1;
        const right = heap[rightIndex];
        // >>>>>>>>>>>>>>>>>>>> doSomething <<<<<<<<<<<<<<<<<<<
        // 左节点 比 父节点小
        if (left !== undefined && compare(left, node) < 0) {
            // 右节点 比 左节点小
            if (right !== undefined && compare(right, left) < 0) {
                // 父节点和有节点交换
                heap[index] = right;
                heap[rightIndex] = node;
                index = rightIndex;
            }else {
                heap[index] = left;
                heap[leftIndex] = node;
                index = leftIndex;
            }
        } else if(right !== undefined && compare(right, node) < 0){
            heap[index] = left;
            heap[leftIndex] = node;
            index = leftIndex;
        } else {
            return
        }
    }
}

/**
 * const a = { sortIndex: 2, id: 1 };
 * const b = { sortIndex: 1, id: 2 };
 * const c = { sortIndex: 2, id: 3 };
 * compare(a, b); // 2 - 1 = 1 > 0，返回 1 说明 a 的优先级低于 b，b 应排在 a 前面
 * @param {*} a 
 * @param {*} b 
 * @returns 
 */
function compare(a, b) {
    const diff = a.sortIndex - b.sortIndex;
    return diff !== 0 ? diff : a.id - b.id;
}

// let heap = [];
// let id = 1; // 自增的函数
// sortIndex 表示优先级 在 id排序
// push(heap, { sortIndex: 1, id: id++ })
// push(heap, { sortIndex: 2, id: id++ })
// push(heap, { sortIndex: 3, id: id++ })
// push(heap, { sortIndex: 4, id: id++ })
// push(heap, { sortIndex: 5, id: id++ })
// push(heap, { sortIndex: 6, id: id++ })
// push(heap, { sortIndex: 7, id: id++ })
// // console.log(peek(heap))
// // push(heap, { sortIndex: 0, id: id++ })
// console.log(heap)
// // pop(heap)
// // console.log(peek(heap))
// console.log(pop(heap))
// console.log(heap)
// console.log(peek(heap))