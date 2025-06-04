export function initializeUpdateQueue(fiber) {
    // pending 是 循环链表
    const queue = {
        shared: {
            pending: null,
        },
    };
    fiber.updateQueue = queue;
}