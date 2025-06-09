export const allNativeEvents = new Set();

export function registerTwoPhaseEvent(registrationName, dependencies) {
    registerDirectEvent(registrationName, dependencies);
    registerDirectEvent(registrationName + "Capture", dependencies);
}

export function registerDirectEvent(registrationName, dependencies) {
    // onClick ['click']
    // onClickCapture ['click'] registrationName =  onClickCapture 这里没用到
    for (let i = 0; i < dependencies.length; i++) {
        allNativeEvents.add(dependencies[i]); // click
    }
}