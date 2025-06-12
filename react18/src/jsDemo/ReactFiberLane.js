const NoLanes = 0b00;
const NoLane = 0b00;
const SyncLane = 0b01;
const SyncBatchedLane = 0b10;

/**
 * 判断subset是不是set的子集
 * @param {*} set 
 * @param {*} subset 
 * @returns 
 */
function isSubsetOfLanes(set, subset) {
    //  & ： 只有 set 和 subset 都为 1 的位才为 1。
    // 说明 subset 所有为 1 的位在 set 中也都是 1，
    // 即 subset 是 set 的子集。
    return (set & subset) === subset;
    // 假设：
        // set = 0b0111（即 7，含有 lane1、lane2、lane3）
        // subset = 0b0011（即 3，含有 lane1、lane2）
    // 计算：
        // set & subset = 0b0111 & 0b0011 = 0b0011
        // 0b0011 === 0b0011，返回 true
}

/**
 * 合并两个车道 多个 lane 可以通过按位或（|）合并
 * 合并两个 lane（车道），返回一个包含所有 lane 的新值。
 * @param {*} a 
 * @param {*} b 
 * @returns 
 */
function mergeLanes(a, b) {
    return a | b;
}

module.exports = {
    NoLane,
    NoLanes,
    SyncLane,
    SyncBatchedLane,
    isSubsetOfLanes,
    mergeLanes
}