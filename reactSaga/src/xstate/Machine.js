function Machine(config) {
    return new StateNode(config);
}


/**
 * id: 'toggle', // 开关
        initial: 'close', // 初始状态
        context: { value },
 */
class StateNode {
    constructor(config, machine, value) {
        this.config = config; // 完整配置
        this.initial = config.initial // close
        this.value = value || config.initial; // value || close
        this.machine = machine || this; // this
        this.on = config.on; // 遇到什么时间变成什么状态
        let states = {};
        if (config.states) {
            for (let key in config.states) {
                states[key] = new StateNode(config.states[key], this.machine, key);
            }
        }
        this.states = states;
    }

    next = (event) => {
        let { type } = event;
        let nextState = this.on[type];
        return this.getStateNode(nextState);
    }
    
    getStateNode = (stateKey) => {
        return this.machine.states[stateKey];
    }
}
export default Machine;