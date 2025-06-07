import { allNativeEvents } from "./EventRegistry";
import * as SimpleEventPlugin from "./plugins/SimpleEventPlugin";

// 注册事件名
SimpleEventPlugin.registerEvents();

// 执行操作
export function listenToAllSupportedEvents(rootContainerElement) {
    allNativeEvents.forEach((domEventName) => {
        console.log(domEventName);
    });
}
