import { allowConcurrentByDefault } from 'shared/ReactFeatureFlags';

export const TotalLanes = 31;
export const NoLanes = 0b0000000000000000000000000000000;
export const NoLane = 0b0000000000000000000000000000000;
export const SyncLane = 0b0000000000000000000000000000001;// 1
export const InputContinuousLane = 0b0000000000000000000000000000100;// 4
export const DefaultLane = 0b0000000000000000000000000010000;// 16
export const NonIdleLanes = 0b0001111111111111111111111111111;
export const IdleLane = 0b0100000000000000000000000000000;

export const NoTimestamp = -1;

export function mergeLanes(a, b) {
    return a | b;
}
export function markRootUpdated(root, updateLane) {
    // 等待生效的lane
    root.pendingLanes |= updateLane;
}

// 获取最高优先级
/**
 * 
 * @param {*} root 
 * @param {当前渲染中车道} wipLanes 
 * @returns 
 */
export function getNextLanes(root, wipLanes) {
    // 获取所有车道
    const pendingLanes = root.pendingLanes;
    if (pendingLanes === NoLanes) {
        return NoLanes;
    }
    // 最高优先级车道
    const nextLanes = getHighestPriorityLanes(pendingLanes);

    // >>>>>>>>>>>>>>>>>>> 高优先级打断低优先级 <<<<<<<<<<<<<<<

    // 判断新车道 > 比渲染中大，优先级低，则返回 wipLanes「最高级车道」
    if (wipLanes !== NoLanes && wipLanes !== nextLanes) {
        if (nextLanes >= wipLanes) {
            return wipLanes;
        }
    }
    return nextLanes;
}

function getHighestPriorityLanes(lanes) {
    return getHighestPriorityLane(lanes);
}

// 只能返回一个车道
export function getHighestPriorityLane(lanes) {
    return lanes & -lanes;
}

export function includesNonIdleWork(lanes) {
    return (lanes & NonIdleLanes) !== NoLanes;
}
export function includesBlockingLane(root, lanes) {
    if (allowConcurrentByDefault) {
        return false;
    }
    const SyncDefaultLanes = InputContinuousLane | DefaultLane;
    return (lanes & SyncDefaultLanes) !== NoLanes;
}
export function isSubsetOfLanes(set, subset) {
    return (set & subset) === subset;
}


function pickArbitraryLaneIndex(lanes) {
  return 31 - Math.clz32(lanes);
}

export function markStarvedLanesAsExpired(root, currentTime) {
  const pendingLanes = root.pendingLanes;
  const expirationTimes = root.expirationTimes;
  let lanes = pendingLanes
  while (lanes > 0) {
    const index = pickArbitraryLaneIndex(lanes);
    const lane = 1 << index;
    const expirationTime = expirationTimes[index];
    if (expirationTime === NoTimestamp) {
      expirationTimes[index] = computeExpirationTime(lane, currentTime);
    } else if (expirationTime <= currentTime) {
      root.expiredLanes |= lane;
    }
    lanes &= ~lane;
  }
}

function computeExpirationTime(lane, currentTime) {
  switch (lane) {
    case SyncLane:
    case InputContinuousLane:
      return currentTime + 250;
    case DefaultLane:
      return currentTime + 5000;
    case IdleLane:
      return NoTimestamp;
    default:
      return NoTimestamp;
  }
}
export function createLaneMap(initial) {
  const laneMap = [];
  for (let i = 0; i < TotalLanes; i++) {
    laneMap.push(initial);
  }
  return laneMap;
}
export function includesExpiredLane(root, lanes) {
  return (lanes & root.expiredLanes) !== NoLanes;
}
export function markRootFinished(root, remainingLanes) {
  const noLongerPendingLanes = root.pendingLanes & ~remainingLanes;
  root.pendingLanes = remainingLanes;
  let lanes = noLongerPendingLanes;
  const expirationTimes = root.expirationTimes;
  while (lanes > 0) {
    const index = pickArbitraryLaneIndex(lanes);
    const lane = 1 << index;
    expirationTimes[index] = NoTimestamp;
    lanes &= ~lane;
  }
}
