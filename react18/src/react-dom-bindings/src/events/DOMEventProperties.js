import { registerTwoPhaseEvent } from "./EventRegistry";

export const topLevelEventsToReactNames = new Map();

const simpleEventPluginEvents = ["click"];
function registerSimpleEvent(domEventName, reactName) {
    // 将原生名字和react 做关联， 在派发更新时获取
    topLevelEventsToReactNames.set(domEventName, reactName);
    registerTwoPhaseEvent(reactName, [domEventName]);
}

export function registerSimpleEvents() {
    for (let i = 0; i < simpleEventPluginEvents.length; i++) {
        const eventName = simpleEventPluginEvents[i]; // click
        const domEventName = eventName.toLowerCase(); // click
        const capitalizedEvent = eventName[0].toUpperCase() + eventName.slice(1); // Click
        registerSimpleEvent(domEventName, `on${capitalizedEvent}`); // click=>onClick
    }
}