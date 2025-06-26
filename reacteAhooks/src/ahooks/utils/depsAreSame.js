/** 在实现类似 useEffect 或 useMemo 的 Hook 时，可以用此函数来检查依赖数组（deps）是否发生变化，以便决定是否需要执行某些操作
 * 
 * @param {*} oldDeps 
 * @param {*} deps 
 * @returns 
 */
export default function depsAreSame(oldDeps, deps) {
    // 引用比较
    if (oldDeps === deps) return true;
    // 数组元素比较
    for (let i = 0; i < oldDeps.length; i++) {
        // 使用 Object.is() 方法进行比较。Object.is() 方法类似于 ===，但在处理 NaN 和 -0 与 +0 的情况下有不同的行为。它可以准确地比较两个值。
        if (!Object.is(oldDeps[i], deps[i])) return false;
    }
    return true;
}