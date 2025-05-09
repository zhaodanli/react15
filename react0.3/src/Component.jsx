export default class Component {
    constructor(props) {
        // 私有属性
        this.props = props;
    }

    setState(partialState) {
        // 1. 更新状态 接收两个参数 新元素、新状态
        this._currentComponent.update(null, partialState);
    }
}