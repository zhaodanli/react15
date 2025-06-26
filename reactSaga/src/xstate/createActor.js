var InterpreterStatus = {
    NotStarted: 0,
    Running: 1,
    Stopped: 2
}

class CreateActor {
    listeners = []
    constructor(machine) {
        this.machine = machine;
        this.listeners = new Set(); //监听函数， 状态发生改变执行
        this.status = InterpreterStatus.NotStarted; // 当前运行状态
        this.state = machine.states[machine.initial];
    }

    // 发送指令
    send = (event) => {
        this.state = this.state.next(event);
        this.listeners.forEach(l => l(this.state));
    }

    // 监听
    onTransition(listener) {
        this.listeners.add(listener);
        return this;
    }

    // 启动
    start() {
        this._status = InterpreterStatus.Running;
        return this;
    }
}

function createActor(machine, options) {
    var interpreter = new CreateActor(machine, options);
    return interpreter;
}

export default createActor;